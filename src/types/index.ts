export interface Product {
    id: string | number;
    name: string;
    nameEn?: string;
    namePart2?: string;
    namePart2En?: string;
    price: number;
    image: string;
    intensity: number;
    desc?: string;
    descEn?: string;
    brewSizes?: string[];
    notes?: string[];
}
