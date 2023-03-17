import NumoenList from "@numoen/default-token-list";
import type { TokenInfo } from "@saberhq/token-utils";
import { Fraction, Token } from "@uniswap/sdk-core";
import * as fs from "fs/promises";
import { GraphQLClient } from "graphql-request";
import { getAddress } from "viem";

import { createPoolLaunchBanner } from "../createPoolLaunchBanner";
import { LendginesDocument } from "../gql/numoen/graphql";
import { parseLendgines } from "../graphql/numoen";
import { numoenSubgraphs } from "../lib/config";
import { scale } from "../lib/constants";
import type { Lendgine } from "../lib/lendgine";
import { fractionToPrice } from "../lib/price";
import { WrappedTokenInfo } from "../lib/wrappedTokenInfo";

export interface PoolInfoRaw {
  id: string;
  name: string;

  tokens: readonly [TokenInfo, TokenInfo];
  tokenIcons: readonly [TokenInfo, TokenInfo];
  underlyingIcons: readonly [TokenInfo, TokenInfo];

  currency: string;
  lpToken: TokenInfo;
  hidden?: boolean;
  newPoolID?: string;
}

export const buildPoolBanners = async (
  chainID: keyof typeof numoenSubgraphs
): Promise<void> => {
  const client = new GraphQLClient(numoenSubgraphs[chainID]);
  const lendgines = parseLendgines(await client.request(LendginesDocument));

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

  const dir = `${__dirname}/../../data`;
  await fs.mkdir(dir, { recursive: true });

  const bannersDir = `${dir}/banners-pools/${chainID}`;
  await fs.mkdir(bannersDir, { recursive: true });

  await Promise.all(
    validLendgines.map(async (lendgine) => {
      // TODO: lendgineToMarket
      const { jpg, png } = await createPoolLaunchBanner({
        base: lendgine.token0.tokenInfo,
        quote: lendgine.token1.tokenInfo,
      });
      await fs.writeFile(`${bannersDir}/${lendgine.address}.jpg`, jpg);
      await fs.writeFile(`${bannersDir}/${lendgine.address}.png`, png);
    })
  );
};

Promise.all([buildPoolBanners(42220), buildPoolBanners(42161)]).catch((err) => {
  console.error(err);
  process.exit(1);
});
