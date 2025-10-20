export type ColorScheme = "gandalf-grey" | "gandalf-white" | "valinor" | "mithrandir";

export class UserOptions {
    defaultColumns: number;
    theme: "light" | "dark" | "system" = "light";
    colorScheme: ColorScheme = "gandalf-grey";

    constructor(defaultColumns: number | null = null) {
        this.defaultColumns = defaultColumns || 2;
    }
}
