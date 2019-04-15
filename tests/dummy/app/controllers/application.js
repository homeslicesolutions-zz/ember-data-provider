import Controller from '@ember/controller';
import { make, mockFindAll } from 'ember-data-factory-guy';

export default Controller.extend({
  init(...args) {
    this._super(...args);

    let users = [
      make('user', { name: 'Huey' }),
      make('user', { name: 'Dewey' }),
      make('user', { name: 'Louie' }),
    ];

    mockFindAll('user').returns({ models: users });
  },

  actions: {
    addChipmunk() {
      make('user', { name: 'Brittney' });
    },
  },
});
