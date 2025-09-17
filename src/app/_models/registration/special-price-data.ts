export class SpecialPriceData {
  private readonly _standardPrice: number;
  private readonly _promoEnabled: boolean;
  private readonly _promoPrice: number;
  private readonly _promoEndDatePrice: string;

  constructor(standardPrice: number, promoEnabled: boolean, promoPrice: number, promoEndDatePrice: string) {
    this._standardPrice = standardPrice;
    this._promoEnabled = promoEnabled;
    this._promoPrice = promoPrice;
    this._promoEndDatePrice = promoEndDatePrice;
  }

  get standardPrice(): number {
    return this._standardPrice;
  }

  get promoEnabled(): boolean {
    return this._promoEnabled;
  }

  get promoPrice(): number {
    return this._promoPrice;
  }

  get promoEndDatePrice(): string {
    return this._promoEndDatePrice;
  }
}
