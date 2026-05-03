export interface FilterColumns {
    key: string;
    header: string;
    placeholder: string;
    type: string;
    canSort: boolean;
    // Tady říkáme: "Může to být pole stringů NEBO pole objektů"
    options?: string[] | { value: string | number; label: string }[];
}