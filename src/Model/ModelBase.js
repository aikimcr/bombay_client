import { getFromURLString, putToURLString } from '../Network/Network';

// Use a Javascript class rather than just a module.  This allows simpler derivation.
class ModelBase {
    static isModel(model) {
        return model instanceof this;
    }

    static from(model) {
        if (model instanceof this) {
            return new this(null, model.getJSON());
        } else {
            return new this(null, model);
        }
    }

    #idUrl;
    #readyPromise = Promise.resolve({});
    #data = {};
    #refModels = {};

    constructor(url, data, options) {
        if (data) {
            this.createRefmodels(data);
            this.#readyPromise = Promise.resolve(this.#data);
        } else if (url) {
            this.#idUrl = url;
            this.#readyPromise = getFromURLString(this.#idUrl)
            .then((fetchedData) => {
                this.createRefmodels(fetchedData);
                return Promise.resolve(fetchedData);
            });
        } else {
            this.#data = {};
        }
    }

    idUrl() {
        return this.#idUrl;
    }

    ready() {
        return this.#readyPromise;
    }

    createRefmodels(data) {
        this.#data = {...data};
        if (this.#data.url) {
            this.#idUrl = this.#data.url;
        }
    }

    addRef(modelName, refModel) {
        this.#refModels[refModel.url] = refModel;

        this[modelName] = function(url) {
            return this.#refModels[url];
        }.bind(this, refModel.url);

        return refModel.url;
    }

    getRef(url) {
        return this.#refModels[url];
    }

    get(fieldName) {
        if (this.#data.hasOwnProperty(fieldName)) {
            return this.#data[fieldName];
        }

        throw new Error(`No field "${fieldName}" is set`);
    }

    async save() {
        const newDef = await putToURLString(this.#idUrl, this.#data);
        this.createRefmodels(newDef);
        return this.#data;
    }

    set(fieldName, value) {
        if(typeof fieldName === 'object' && fieldName !== null) {
            this.#data = { ...this.#data, ...fieldName};
        } else {
            this.#data[fieldName] = value;
        }

        return this;
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