import { Card, comparableRank, Rank, ranks, Suit, suits } from "./Card";

export abstract class Hand {

    public static judgeHand(cards: Card[]): Hand {
        const handSuits = new Map<Suit, Card[]>();
        suits.forEach(suit => handSuits.set(suit, []));
        const handRanks = new Map<Rank, Card[]>();
        ranks.forEach(rank => handRanks.set(rank, []));
        const handSuitRank = new Map<Suit, Map<Rank, Card[]>>();
        suits.forEach(suit => {
            const rankMap = new Map<Rank, Card[]>();
            ranks.forEach(rank => rankMap.set(rank, []));
            handSuitRank.set(suit, rankMap);
        });

        let flash: Suit | undefined;
        cards.forEach(card => {
            const suitMap = handSuits.get(card.suit);
            suitMap?.push(card);
            const rankMap = handRanks.get(card.rank);
            rankMap?.push(card);
            handSuitRank.get(card.suit)?.get(card.rank)?.push(card);
            if (suitMap && suitMap.length >= 5) {
                flash = card.suit;
            }
        });

        // straight flash
        if (flash) {
            const top = this.checkStraight(handSuitRank.get(flash));
            if (top) {
                return new StraightFlash(top);
            }
        }
        // four of a kind
        const fourPairRanks = this.getMaxRanks([4, 1], [], handRanks);
        if (fourPairRanks) {
            return new FourOfAKind(fourPairRanks[0], fourPairRanks[1]);
        }
        // full house
        const fullHouseRanks= this.getMaxRanks([3, 2], [], handRanks);
        if (fullHouseRanks) {
            return new FullHouse(fullHouseRanks[0], fullHouseRanks[1]);
        }
        // flash
        if(flash) {
            let cards = handSuits.get(flash);
            if (cards) {
                cards = cards.sort((a, b) => comparableRank(b.rank) - comparableRank(a.rank));
                return new Flash(cards[0].rank, cards[1].rank, cards[2].rank, cards[3].rank, cards[4].rank);
            }
        }
        // straight
        const straightTopRank = this.checkStraight(handRanks);
        if (straightTopRank) {
            return new Straight(straightTopRank);
        }
        // three of a kind
        const threeOfAKindRanks = this.getMaxRanks([3,1,1], [], handRanks);
        if (threeOfAKindRanks) {
            return new ThreeOfAKind(threeOfAKindRanks[0],threeOfAKindRanks[1],threeOfAKindRanks[2])
        }
        // two pair
        const twoPairRanks = this.getMaxRanks([2,2,1], [], handRanks);
        if (twoPairRanks) {
            return new TwoPair(twoPairRanks[0], twoPairRanks[1], twoPairRanks[2]);
        }
        // one pair
        const onePairRanks = this.getMaxRanks([2,1,1,1], [], handRanks);
        if (onePairRanks) {
            return new OnePair(onePairRanks[0], onePairRanks[1], onePairRanks[2], onePairRanks[3]);
        }
        // high card
        const highCardRanks = this.getMaxRanks([1,1,1,1,1], [], handRanks);
        if (highCardRanks) {
            return new HighCard(highCardRanks[0], highCardRanks[1], highCardRanks[2], highCardRanks[3], highCardRanks[4]);
        }
        throw new Error("Judge hand logic is invalid.");
    }

    public abstract handRank: number;
    
    constructor(
        private readonly innerHandRanks: Rank[]
    ){
    }

    public isStrongerThan(hand: Hand): boolean {
        if (this.handRank === hand.handRank) {
            for (let i=0; i<this.innerHandRanks.length; i++) {
                if (this.innerHandRanks[i] !== hand.innerHandRanks[i]) {
                    return comparableRank(this.innerHandRanks[i]) > comparableRank(hand.innerHandRanks[i]);
                }
            }
        }
        return this.handRank > hand.handRank;
    }

    private static checkStraight(rankMap?: Map<Rank, Card[]>): Rank | undefined {
        if (!rankMap) {
            return undefined;
        }
        straightCheck: for (let top = 13; top >= 4; top --) {
            for (let check=top; check>= top - 4; check --) {
                const checkRank = (check % 13 + 1) as Rank;
                const rankCards = rankMap.get(checkRank);
                if (!rankCards || rankCards.length === 0) {
                    continue straightCheck;
                }
            }
            return (top % 13 + 1) as Rank;
        }
        return undefined;
    }

    private static getMaxRanks(pairAmounts: number[], ignoreRanks: Rank[], rankMap?: Map<Rank, Card[]>): Rank[] | undefined {
        if (!rankMap) {
            return undefined;
        }
        const ignoreMap = new Set(ignoreRanks);
        const pairAmount = pairAmounts.shift();
        if (!pairAmount) {
            return [];
        }
        for (let check = 13; check >= 0; check --) {
            const checkRank = (check % 13 + 1) as Rank;
            if (ignoreMap.has(checkRank)) {
                continue;
            }
            const cards = rankMap.get(checkRank);
            if (cards && cards.length >= pairAmount) {
                ignoreRanks.push(checkRank);
                const remainingResults = this.getMaxRanks(pairAmounts, ignoreRanks, rankMap);
                if (remainingResults) {
                    return [checkRank, ...remainingResults];
                } else {
                    return undefined;
                }
            }
        }
        return undefined;
    }
}

export class WeakestHand extends Hand {
    public readonly handRank = -1;
    constructor(){
        super([]);
    }
}

export class HighCard extends Hand {
    public readonly handRank = 0;
    constructor(
        public readonly kicker1: Rank,
        public readonly kicker2: Rank,
        public readonly kicker3: Rank,
        public readonly kicker4: Rank,
        public readonly kicker5: Rank,
    ){
        super([kicker1, kicker2, kicker3, kicker4, kicker5]);
    }
}

export class OnePair extends Hand {
    public readonly handRank = 1;
    constructor(
        public readonly pairRank: Rank,
        public readonly kicker1: Rank,
        public readonly kicker2: Rank,
        public readonly kicker3: Rank,
    ){
        super([pairRank, kicker1, kicker2, kicker3]);
    }
}

export class TwoPair extends Hand {
    public readonly handRank = 2;
    constructor(
        public readonly pairRank1: Rank,
        public readonly pairRank2: Rank,
        public readonly kicker: Rank,
    ){
        super([pairRank1, pairRank2, kicker]);
    }
}

export class ThreeOfAKind extends Hand {
    public readonly handRank = 3;
    constructor(
        public readonly pairRank: Rank,
        public readonly kicker1: Rank,
        public readonly kicker2: Rank,
    ){
        super([pairRank, kicker1, kicker2]);
    }
}

export class Straight extends Hand {
    public readonly handRank = 4;
    constructor(
        public readonly topRank: Rank,
    ){
        super([topRank]);
    }
}

export class Flash extends Hand {
    public readonly handRank = 5;
    constructor(
        public readonly rank1: Rank,
        public readonly rank2: Rank,
        public readonly rank3: Rank,
        public readonly rank4: Rank,
        public readonly rank5: Rank,
    ){
        super([rank1, rank2, rank3, rank4, rank5]);
    }
}

export class FullHouse extends Hand {
    public readonly handRank = 6;
    constructor(
        public readonly threePairRank: Rank,
        public readonly twoPairRank: Rank,
    ){
        super([threePairRank, twoPairRank]);
    }
}

export class FourOfAKind extends Hand {
    public readonly handRank = 7;
    constructor(
        public readonly FourPaireRank: Rank,
        public readonly kicker: Rank,
    ){
        super([FourPaireRank, kicker]);
    }
}

export class StraightFlash extends Hand {
    public readonly handRank = 8;
    constructor(
        public readonly topRank: Rank,
    ){
        super([topRank]);
    }
}

