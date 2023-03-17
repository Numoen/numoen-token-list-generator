import type { Fraction, Token } from "@uniswap/sdk-core";
import { Price } from "@uniswap/sdk-core";
import JSBI from "jsbi";

export const fractionToPrice = <TBase extends Token, TQuote extends Token>(
  price: Fraction,
  base: TBase,
  quote: TQuote
) => {
  return new Price(
    base,
    quote,
    JSBI.multiply(
      price.denominator,
      JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(base.decimals))
    ),
    JSBI.multiply(
      price.numerator,
      JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(quote.decimals))
    )
  );
};
