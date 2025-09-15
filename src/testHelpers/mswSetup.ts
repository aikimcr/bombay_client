import { http, HttpResponse } from 'msw';
import {
  TestCollectionOneFetchBody,
  TestCollectionOneURL,
} from './TestCollectionTypes';

const TestData: TestCollectionOneFetchBody[] = [
  {
    data: [
      {
        id: 1,
        name: 'special voice melted',
        description: 'Ipsum amet consectetur commodo et ut et voluptate sint.',
      },
      {
        id: 2,
        name: 'picture than nails',
        description:
          'Reprehenderit aute ullamco quis qui duis do et quis minim labore esse.',
      },
      {
        id: 3,
        name: 'never ask dead',
        description:
          'Minim dolor eu fugiat tempor irure labore nostrud pariatur commodo aute.',
      },
      {
        id: 4,
        name: 'seems steady cry',
        description: 'Mollit voluptate nostrud nulla laborum nisi do occaecat.',
      },
      {
        id: 5,
        name: 'jack southern jet',
        description: 'Eiusmod qui culpa veniam eiusmod adipisicing aliqua.',
      },
      {
        id: 6,
        name: 'manner by trap',
        description:
          'Pariatur sit nulla laboris minim proident dolor aute amet id magna.',
      },
      {
        id: 7,
        name: 'perfect canal arrow',
        description:
          'Labore laboris magna reprehenderit aliquip ex Lorem sit non nisi exercitation ipsum voluptate.',
      },
      {
        id: 8,
        name: 'may river begun',
        description: 'Officia ipsum occaecat ad proident elit aliqua.',
      },
      {
        id: 9,
        name: 'donkey national writing',
        description:
          'Pariatur deserunt duis dolore velit cupidatat sunt ex duis duis veniam aliqua consectetur laborum.',
      },
      {
        id: 10,
        name: 'frog private would',
        description:
          'Commodo reprehenderit aute adipisicing esse nostrud pariatur incididunt eu.',
      },
    ],
    nextPage: `${TestCollectionOneURL}?offset=10&limit=10`,
  },
  {
    data: [
      {
        id: 11,
        name: 'notice visit happily',
        description: 'Ipsum amet consectetur commodo et ut et voluptate sint.',
      },
      {
        id: 12,
        name: 'condition aid hung',
        description:
          'Reprehenderit aute ullamco quis qui duis do et quis minim labore esse.',
      },
      {
        id: 13,
        name: 'variety class later',
        description:
          'Minim dolor eu fugiat tempor irure labore nostrud pariatur commodo aute.',
      },
      {
        id: 14,
        name: 'been edge student',
        description: 'Mollit voluptate nostrud nulla laborum nisi do occaecat.',
      },
      {
        id: 15,
        name: 'his brief length',
        description: 'Eiusmod qui culpa veniam eiusmod adipisicing aliqua.',
      },
      {
        id: 16,
        name: 'flame value fort',
        description:
          'Pariatur sit nulla laboris minim proident dolor aute amet id magna.',
      },
      {
        id: 17,
        name: 'police electric found',
        description:
          'Labore laboris magna reprehenderit aliquip ex Lorem sit non nisi exercitation ipsum voluptate.',
      },
      {
        id: 18,
        name: 'letter beneath day',
        description: 'Officia ipsum occaecat ad proident elit aliqua.',
      },
      {
        id: 19,
        name: 'mix leaving worse',
        description:
          'Pariatur deserunt duis dolore velit cupidatat sunt ex duis duis veniam aliqua consectetur laborum.',
      },
      {
        id: 20,
        name: 'younger simplest swept',
        description:
          'Commodo reprehenderit aute adipisicing esse nostrud pariatur incididunt eu.',
      },
    ],
    nextPage: `${TestCollectionOneURL}?offset=20&limit=10`,
    prevPage: `${TestCollectionOneURL}?offset=0&limit=10`,
  },
  {
    data: [
      {
        id: 21,
        name: 'barn mixture handle',
        description: 'Ipsum amet consectetur commodo et ut et voluptate sint.',
      },
      {
        id: 22,
        name: 'pair arm temperature',
        description:
          'Reprehenderit aute ullamco quis qui duis do et quis minim labore esse.',
      },
      {
        id: 23,
        name: 'whom answer try',
        description:
          'Minim dolor eu fugiat tempor irure labore nostrud pariatur commodo aute.',
      },
      {
        id: 24,
        name: 'there father bread',
        description: 'Mollit voluptate nostrud nulla laborum nisi do occaecat.',
      },
      {
        id: 25,
        name: 'laid correct lack',
        description: 'Eiusmod qui culpa veniam eiusmod adipisicing aliqua.',
      },
      {
        id: 26,
        name: 'factor willing dead',
        description:
          'Pariatur sit nulla laboris minim proident dolor aute amet id magna.',
      },
      {
        id: 27,
        name: 'date chair free',
        description:
          'Labore laboris magna reprehenderit aliquip ex Lorem sit non nisi exercitation ipsum voluptate.',
      },
      {
        id: 28,
        name: 'love mad nearest',
        description: 'Officia ipsum occaecat ad proident elit aliqua.',
      },
      {
        id: 29,
        name: 'truth eleven differ',
        description:
          'Pariatur deserunt duis dolore velit cupidatat sunt ex duis duis veniam aliqua consectetur laborum.',
      },
      {
        id: 30,
        name: 'younger describe eight',
        description:
          'Commodo reprehenderit aute adipisicing esse nostrud pariatur incididunt eu.',
      },
    ],
    prevPage: `${TestCollectionOneURL}?offset=10&limit=10`,
  },
];

export const TestCollectionHandlers = [
  http.get(TestCollectionOneURL, ({ request }) => {
    const requestUrl = new URL(request.url);

    if (requestUrl.searchParams.size > 0) {
      const offset = requestUrl.searchParams.get('offset');
      if (offset === '10') {
        return HttpResponse.json(TestData[1]);
      }

      if (offset === '20') {
        return HttpResponse.json(TestData[2]);
      }
    }

    return HttpResponse.json(TestData[0]);
  }),
];
