export interface Product {
    id: string | number;
    name: string;
    namePart2?: string;
    price: number;
    image: string;
    intensity: number;
    desc?: string;
    brewSizes?: string[];
    notes?: string[];
}
