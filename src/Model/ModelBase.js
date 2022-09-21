import { getFromURLString } from "../Network/Network";

// Use a Javascript class rather than just a module.  This allows simpler derivation.
class ModelBase {
    static isModel(model) {
        return model instanceof this;
    }

    static from(model) {
        if (model instanceof this) {
            return model;
        } else {
            return new this(model);
        }
    }

    static async fetch(url) {
        const body = await getFromURLString(url);
        return this.from(body);
    }

    #idUrl;
    #data = {};

    constructor(data, options) {
        this.#idUrl = data.url ?? '';
        this.#data = data;
    }

    idUrl() {
        return this.#idUrl;
    }

    get(fieldName) {
        if (this.#data.hasOwnProperty(fieldName)) {
            return this.#data[fieldName];
        }

        throw new Error(`No field "${fieldName}" is set`);
    }

    set(fieldName, value) {
        this.#data[fieldName] = value;
    }

    // Handy to have ana also helps with testing
    toJSON() {
        return {...this.#data};
    }

    toString() {
        return JSON.stringify(this.toJSON());
    }
};

export default ModelBase;