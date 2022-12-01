import type { ButtonData } from '../interfaces/Button';

export class Button {
    constructor(options: ButtonData) {
        Object.assign(this, options);
    }
}
