export enum PageId {
    "Entrance",
    "Table",
}

export type TranslatePage = (pageId: PageId) => void;