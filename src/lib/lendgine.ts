import type { Price, Token } from "@uniswap/sdk-core";
import type { Address } from "viem";

import type { WrappedTokenInfo } from "./wrappedTokenInfo";

export type Lendgine = {
  token0: WrappedTokenInfo;
  token1: WrappedTokenInfo;

  lendgine: Token;

  bound: Price<WrappedTokenInfo, WrappedTokenInfo>;

  token0Exp: number;
  token1Exp: number;

  address: Address;
};
