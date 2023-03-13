import NumoenList from "@numoen/default-token-list";
import * as fs from "fs/promises";

import { createAssetLaunchBanner } from "../createAssetLaunchBanner";

export const buildLaunchBanners = async (): Promise<void> => {
  const dir = `${__dirname}/../../data`;
  await fs.mkdir(dir, { recursive: true });
  await fs.mkdir(`${dir}/solana-token-list`, { recursive: true });

  const bannersDir = `${dir}/banners-assets`;
  await fs.mkdir(bannersDir, { recursive: true });
  await fs.mkdir(`${dir}/lists/`, { recursive: true });

  const tokens = NumoenList.tokens;

  await Promise.all(
    tokens.map(async (token) => {
      const { jpg, png } = await createAssetLaunchBanner(token);
      await fs.writeFile(`${bannersDir}/${token.address}.jpg`, jpg);
      await fs.writeFile(`${bannersDir}/${token.address}.png`, png);
    })
  );
};

buildLaunchBanners().catch((err) => {
  console.error(err);
  process.exit(1);
});
