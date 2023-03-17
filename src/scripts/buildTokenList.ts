import NumoenList from "@numoen/default-token-list";
import { Fraction, Token } from "@uniswap/sdk-core";
import type { TokenList, Version } from "@uniswap/token-lists";
import * as fs from "fs/promises";
import { GraphQLClient } from "graphql-request";
import { getAddress } from "viem";

import { createPowerTokenIcon } from "../createPowerTokenIcon";
import { LendginesDocument } from "../gql/numoen/graphql";
import { parseLendgines } from "../graphql/numoen";
import { numoenSubgraphs } from "../lib/config";
import { scale } from "../lib/constants";
import type { Lendgine } from "../lib/lendgine";
import { fractionToPrice } from "../lib/price";
import { WrappedTokenInfo } from "../lib/wrappedTokenInfo";

export const buildTokenList = async (
  chainID: keyof typeof numoenSubgraphs
): Promise<void> => {
  const client = new GraphQLClient(numoenSubgraphs[chainID]);
  const lendgines = parseLendgines(await client.request(LendginesDocument));

  const { version } = JSON.parse(
    (await fs.readFile(`${__dirname}/../../package.json`)).toString()
  ) as {
    version: Version;
  };

  const dir = `${__dirname}/../../data`;
  await fs.mkdir(`${dir}/solana-token-list`, { recursive: true });

  const assetsDir = `${dir}/assets/${chainID}`;
  const assetsJpgDir = `${dir}/assets-jpg/${chainID}`;
  await fs.mkdir(assetsDir, { recursive: true });
  await fs.mkdir(assetsJpgDir, { recursive: true });
  await fs.mkdir(`${dir}/lists/`, { recursive: true });

  const validLendgines = lendgines
    .map((l) => {
      const token0 = NumoenList.tokens.find(
        (t) => getAddress(t.address) === l.token0
      );
      const token1 = NumoenList.tokens.find(
        (t) => getAddress(t.address) === l.token1
      );

      if (!token0 || !token1) return undefined;

      const lendgine = {
        token0: new WrappedTokenInfo(token0),
        token1: new WrappedTokenInfo(token1),
        token0Exp: l.token0Exp,
        token1Exp: l.token1Exp,

        lendgine: new Token(chainID, l.address, 18),
        address: l.address,

        bound: fractionToPrice(
          new Fraction(l.upperBound, scale),
          new WrappedTokenInfo(token1),
          new WrappedTokenInfo(token0)
        ),
      };
      // TODO: validate lendgine

      return lendgine;
    })
    .filter((l): l is Lendgine => !!l);

  const powerTokens = await Promise.all(
    validLendgines.map(async (l) => {
      // TODO: lendgineToMarket
      const { png, jpg } = await createPowerTokenIcon({
        base: l.token0.tokenInfo,
        quote: l.token1.tokenInfo,
      });
      await fs.mkdir(`${assetsDir}/${l.address}`, {
        recursive: true,
      });
      await fs.writeFile(`${assetsDir}/${l.address}/icon.png`, png);
      await fs.writeFile(`${assetsJpgDir}/${l.address}.jpg`, jpg);
      // TODO: add name and symbol to token
      return {
        ...l.lendgine,
        name: "name",
        symbol: "symbol",
        logoURI: `https://raw.githubusercontent.com/numoen/numoen-power-token-list/master/assets/${chainID}/${l.address}/icon.png`,
      };
    })
  );

  // TODO: add a version
  const powerTokenList: TokenList = {
    name: `Numoen Power Token List (${chainID})`,
    logoURI:
      "https://raw.githubusercontent.com/numoen/numoen-power-token-list/master/sbr.svg",
    version: version,
    tags: {},
    timestamp: new Date().toISOString(),
    tokens: powerTokens.sort((a, b) => {
      return a.address < b.address ? -1 : 1;
    }),
  };
  await fs.writeFile(
    `${dir}/lists/numoen-power-token.${chainID}.json`,
    JSON.stringify(powerTokenList, null, 2)
  );
};

Promise.all([buildTokenList(42161), buildTokenList(42220)]).catch((err) => {
  console.error(err);
  process.exit(1);
});
