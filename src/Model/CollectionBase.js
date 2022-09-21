import { getFromURLString, prepareURLFromArgs } from '../Network/Network.js';

import ModelBase from './ModelBase.js';

// Use a Javascript class rather than just a module.  This allows simpler derivation.
class CollectionBase {
    static isCollection(collection) {
        return collection instanceof this;
    }

    static buildUrl(urlOrPath, query = {}) {
        try {
            const url = new URL(urlOrPath);
            for (const key in query) {
                url.searchParams.set(key, query[key]);
            }
            return url.toString();
        } catch(err) {
            return prepareURLFromArgs(urlOrPath, query).toString();
        }
    }

    static async fetch(url) {
        const body = await getFromURLString(this.buildUrl(url).toString());

        return new this(url, {
            models: body.data,
            prevPage: body.prevPage,
            nextPage: body.nextPage,
        });
    }

    #idUrl;
    #modelClass;
    #models = [];
    #prevPage;
    #nextPage;
    #maxModels = 1000; // Trim the model list if it gets longer than this.
    // #pages = [];

    constructor(url, options = {}) {
        this.#idUrl = this.constructor.buildUrl(url);
        this.#modelClass = options.modelClass ?? ModelBase;
        const models = options.models ?? [];
        this.#prevPage = options.prevPage;
        this.#nextPage = options.nextPage;

        this.#nextPage = this.#idUrl;

        models.forEach(model => this.add(model));
    }

    idUrl() {
        return this.#idUrl;
    }

    modelClass() {
        return this.#modelClass;
    }

    models() {
        return [...this.#models];
    }

    length() {
        return this.models().length;
    }

    add(model) {
        this.#models.push(this.#modelClass.from(model));
    }

    async fetchNextPage() {
        if (this.#nextPage) {
            const body = await getFromURLString(this.#nextPage)
                .catch((err) => {
                    if (err.status !== 404) {
                        console.error(err.status, err.message);
                    }

                    return Promise.resolve({
                        data: [],
                        prevPage: this.prevPage,
                        nextPage: undefined,
                    });
                });

            this.#prevPage = body.prevPage;
            this.#nextPage = body.nextPage;
            const currentIds = this.#models.map(model => model.get('id'));
            const newModels = body.data
                .filter(def => !currentIds.includes(def.id))
                .map(def => this.#modelClass.from(def));

            this.#models = [...this.#models, ...newModels].slice(-this.#maxModels);
        }

        return this.#models;
    }

    async fetchPrevPage() {
        if (this.#prevPage) {
            const body = await getFromURLString(this.#prevPage);
            this.#prevPage = body.prevPage;
            this.#nextPage = body.nextPage;
            const currentIds = this.#models.map(model => model.get('id'));
            const newModels = body.data
                .filter(def => !currentIds.includes(def.id))
                .map(def => this.#modelClass.from(def));

            this.#models = [...newModels, ...this.#models].slice(-this.#maxModels);
        }

        return this.#models;
    }

    // Handy to have ana also helps with testing
    toJSON() {
        return {
            data: this.#models.map(model => model.toJSON()),
            prevPage: this.#prevPage,
            nextPage: this.#nextPage,
        };
    }

    toString() {
        return JSON.stringify(this.toJSON());
    }
};

export default CollectionBase;