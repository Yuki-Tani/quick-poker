export class Stack {
    constructor(
        public readonly amount: number
    ){
        if (this.amount < 0) {
            this.amount = 0;
        }
    }

    public isAllIn() {
        return this.amount === 0;
    }

    public addStack(additionalAmount: number): Stack {
        return new Stack(this.amount + additionalAmount);
    }
}

export class Blind {
    constructor(
        public readonly amount: number
    ){
    }

    public getSmallBlind(): Blind {
        return new Blind(Math.floor(this.amount / 2));
    }
}