import {
  mockBuildURL,
  mockGetFromURLString,
  mockPrepareURLFromArgs,
} from '../../../Network/testing';
import {
  getGenericTestIterator,
  makeADef,
  makeAFetchDef,
  makeFetchBodyFromFetchDef,
  makeModelsFromFetchDef,
  TestCollectionOneURL,
  TestModelOne,
  TestModelOneData,
} from '../../../testHelpers';

const testNamesMaster = [
  'fellow',
  'property',
  'yet',
  'article',
  'held',
  'transportation',
  'scene',
  'current',
  'life',
  'printed',
  'blew',
  'fireplace',
  'darkness',
  'paragraph',
  'chair',
  'mainly',
  'meat',
  'occur',
  'handle',
  'swimming',
  'simple',
];

const testDesciptionsMaster = [
  'Sint aliqua sint ex cillum tempor magna dolore.',
  'Cupidatat ipsum cillum ex in mollit non adipisicing.',
  'Lorem elit ad exercitation id cupidatat voluptate eiusmod enim do magna.',
  'Laboris in sit consectetur aute officia pariatur tempor laborum commodo veniam.',
  'Magna laboris id qui reprehenderit minim tempor laboris ipsum non enim ex ad ex.',
  'Voluptate Lorem non aliquip anim ea occaecat tempor consectetur id.',
  'Aute quis in sunt esse tempor cillum est occaecat sit ea id sit ipsum.',
  'Qui laborum occaecat ad esse non consequat.',
  'Ipsum minim nisi non sit enim sit tempor id deserunt laboris.',
  'Enim ex ipsum adipisicing laborum do dolore nisi do cillum est ex culpa aute ut.',
  'Magna proident nulla aute officia officia sint ut amet sunt exercitation reprehenderit labore ullamco nulla.',
  'Magna adipisicing ipsum quis id nostrud voluptate voluptate esse dolore.',
  'Laboris incididunt et ad tempor veniam mollit sint irure voluptate id ex dolore qui.',
  'Sint qui enim officia id duis nisi proident qui velit pariatur duis minim mollit.',
  'Qui dolore eiusmod velit amet proident velit cupidatat.',
  'Mollit labore Lorem ullamco aliquip dolor amet consequat sunt ad sint irure.',
  'Labore nisi cupidatat do velit exercitation aliqua cillum.',
  'Culpa laborum non cupidatat aliqua aliquip ea minim commodo elit culpa laboris sit.',
  'Consequat deserunt enim duis reprehenderit ut eiusmod sunt proident.',
  'Labore velit labore ullamco fugiat ea nostrud dolor ea ut consequat non exercitation et eu.',
  'Elit est eiusmod consectetur in et eu officia pariatur id anim consequat do.',
];

export const setupTestModelOneFetch = () => {
  const nextTestName = getGenericTestIterator('test_name', testNamesMaster);
  const nextTestDescription = getGenericTestIterator(
    'test_description',
    testDesciptionsMaster,
  );

  const getPromise = PromiseWithResolvers();
  mockGetFromURLString.mockReturnValueOnce(getPromise.promise);

  const fetchBody = makeADef(
    TestModelOne.TableName,
    (def: TestModelOneData) => {
      def.name = nextTestName();
      def.description = nextTestDescription();
    },
  ) as unknown as TestModelOneData;

  return [getPromise, fetchBody];
};

export const setupTestCollectionOneModels = (length = 10) => {
  const nextTestName = getGenericTestIterator('test_name', testNamesMaster);
  const nextTestDescription = getGenericTestIterator(
    'test_description',
    testDesciptionsMaster,
  );

  const fetchDef = makeAFetchDef(
    length,
    TestModelOne.TableName,
    (def: TestModelOneData) => {
      def.name = nextTestName();
      def.description = nextTestDescription();
    },
  );

  const models = makeModelsFromFetchDef(fetchDef, (def: TestModelOneData) => {
    return TestModelOne.from<TestModelOneData, TestModelOne>(def, {
      keepId: true,
    });
  });

  return [models, fetchDef];
};

export const setupTestCollectionOneFetch = (query = {}, length = 10) => {
  const getPromise = PromiseWithResolvers();
  mockGetFromURLString.mockReturnValueOnce(getPromise.promise);
  mockPrepareURLFromArgs.mockReturnValue(new URL(TestCollectionOneURL));
  mockBuildURL.mockReturnValue(new URL(TestCollectionOneURL));

  const [models, fetchDef] = setupTestCollectionOneModels(length);
  const fetchBody = makeFetchBodyFromFetchDef(
    fetchDef,
    TestModelOne.TableName,
    query,
  );

  return [getPromise, fetchBody, models, fetchDef];
};
