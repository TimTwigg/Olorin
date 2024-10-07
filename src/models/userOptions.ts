export class UserOptions {
    conditions?: string[]
    defaultColumns?: number

    constructor(conditions: string[] = [], defaultColumns: number|null = null) {
        this.conditions = conditions
        this.defaultColumns = defaultColumns||undefined
    }
}