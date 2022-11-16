//
// Collections must:
// - Fetch paged data.
// - Create models from fetched data.
// - Maintain the order of models based on the fetch order.
// - Guarantee that no models are duplicated (based on the model id).
// - Handle empty fetches.
// - Provide mechanisms to fetch next and previous pages.
// - Provide mechanisms to restart the fetch from the beginning.
// - Provide mechanisms to add or remove models.
// - Provide a mechanism to post or delete for models.
// - Be  agnostic to the model type.
import * as Network from "../Network/Network";

import CollectionBase from './CollectionBase';
import ArtistCollection from './ArtistCollection';

it('should not recognize a base model as an artist model', async () => {
    // If the class extension is done correctly, Javascript should just handle this.
    Network._setupMocks();
    const baseCollection = new CollectionBase({});

    Network._setupMockPromise();
    const artistCollection = new ArtistCollection({});

    expect(CollectionBase.isCollection(baseCollection)).toBeTruthy();
    expect(CollectionBase.isCollection(artistCollection)).toBeTruthy();

    expect(ArtistCollection.isCollection(baseCollection)).toBeFalsy();
    expect(ArtistCollection.isCollection(artistCollection)).toBeTruthy();
});