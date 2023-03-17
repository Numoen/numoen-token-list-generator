import NumoenList from "@numoen/default-token-list";
import * as fs from "fs/promises";

import { createAssetLaunchBanner } from "../createAssetLaunchBanner";

export const buildLaunchBanners = async (chainID: number): Promise<void> => {
  const dir = `${__dirname}/../../data`;

  const bannersDir = `${dir}/banners-assets/${chainID}`;
  await fs.mkdir(bannersDir, { recursive: true });

  const tokens = NumoenList.tokens.filter((t) => t.chainId === chainID);

  await Promise.all(
    tokens.map(async (token) => {
      const { jpg, png } = await createAssetLaunchBanner(token);
      await fs.writeFile(`${bannersDir}/${token.address}.jpg`, jpg);
      await fs.writeFile(`${bannersDir}/${token.address}.png`, png);
    })
  );
};

Promise.all([
  buildLaunchBanners(42161),
  buildLaunchBanners(42220),
  buildLaunchBanners(137),
]).catch((err) => {
  console.error(err);
  process.exit(1);
});
