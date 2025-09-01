export class UserOptions {
    defaultColumns: number;

    constructor(defaultColumns: number | null = null) {
        this.defaultColumns = defaultColumns || 2;
    }
}
