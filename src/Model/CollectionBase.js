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

    #idUrl;
    #modelClass;
    #models = [];
    #prevPage;
    #nextPage;
    #readyPromise;
    #maxModels = 1000; // Trim the model list if it gets longer than this.
    // #pages = [];

    constructor(url, options = {}) {
        console.count('construct model');
        this.#idUrl = this.constructor.buildUrl(url);

        this.#modelClass = options.modelClass ?? ModelBase;

        if (options.models != null) {
            const models = options.models;
            this.#prevPage = options.prevPage;
            this.#nextPage = options.nextPage;
            models.forEach(model => this.add(model));
            this.#readyPromise = Promise.resolve(this.#models);
        } else {
            this.#readyPromise = this.#fetch(this.#idUrl);
        }
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
        return this.#models.length;
    }

    ready() {
        return this.#readyPromise;
    }

    add(model) {
        this.#models.push(this.#modelClass.from(model));
    }

    forEach(callback) {
        return this.#models.forEach((model, index, list) => {
            return callback(model, index, list);
        });
    }

    map(callback) {
        return this.#models.map((model, index, list) => {
            return callback(model, index, list);
        });
    }

    reduce(callback, start) {
        return this.#models.reduce((memo, model, index, list) => {
            return callback(memo, model, index, list)
        }, start);
    }

    #mergeModels(data, {reset, append} = {reset: true, append: true}) {
        if (reset) {
            this.#models = [];
        }

        if (data.length > 0) {
            const currentIds = this.#models.map(model => model.get('id'));
            const newModels = data
                .filter(def => !currentIds.includes(def.id))
                .map(def => this.#modelClass.from(def));

            if (append) {
                this.#models = [...this.#models, ...newModels].slice(-this.#maxModels);
            } else {
                this.#models = [...newModels, ...this.#models].slice(0, this.#maxModels);
            }
        }
    }

    async #fetch(url, options) {
        const body = await getFromURLString(url)
            .catch((err) => {
                if (err.status !== 404) {
                    console.error(err.status, err.message);
                }

                this.#prevPage = undefined;
                this.#nextPage = undefined;

                return Promise.resolve({
                    data: [],
                    prevPage: null,
                    nextPage: null,
                });
            });

        this.#mergeModels(body.data, options);
        this.#prevPage = body.prevPage;
        this.#nextPage = body.nextPage;
        return this.#models;
    }

    hasNextPage() {
        return !!this.#nextPage;
    }

    async fetchNextPage() {
        if (this.#nextPage) {
            await this.#fetch(this.#nextPage, {reset: false, append: true});
        }

        return this.#models;
    }

    hasPrevPage() {
        return !!this.#prevPage;
    }

    async fetchPrevPage() {
        if (this.#prevPage) {
            await this.#fetch(this.#prevPage, {reset: false, append: false});
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