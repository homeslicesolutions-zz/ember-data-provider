import { module, test } from 'qunit';
import { set } from '@ember/object';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import {
  make,
  build,
  manualSetup,
  mockQuery,
  mockFindAll,
  mockFindRecord,
} from 'ember-data-factory-guy';
import { waitForElement } from 'carmada/tests/support/wait-for';

module('Integration | Component | data-provider', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    manualSetup(this);
  });

  test('should make query and provide a collection of data (positional params)', async function(assert) {
    // ARRANGE
    const users = [
      make('user', { firstName: 'Huey' }),
      make('user', { firstName: 'Dewey' }),
      make('user', { firstName: 'Louie' }),
    ];
    mockQuery('user').returns({ models: users });

    // ACT
    await this.render(hbs`
      {{#data-provider "user" as |dp|}}
        {{#each dp.data as |u|}}
          <div class="user-name">{{u.firstName}}</div>
        {{/each}}
      {{/data-provider}}
    `);

    // ASSERT
    assert.equal(this.$('.user-name:nth-child(1)').text(), 'Huey');
    assert.equal(this.$('.user-name:nth-child(2)').text(), 'Dewey');
    assert.equal(this.$('.user-name:nth-child(3)').text(), 'Louie');
  });

  test('should refetch if attributes have changed', async function(assert) {
    // ARRANGE
    const ducks = [
      make('user', { firstName: 'Huey' }),
      make('user', { firstName: 'Dewey' }),
      make('user', { firstName: 'Louie' }),
    ];
    const chipmunks = [
      make('user', { firstName: 'Alvin' }),
      make('user', { firstName: 'Simon' }),
      make('user', { firstName: 'Theodore' }),
    ];
    mockQuery('user', { include: ['ducks'] }).returns({ models: ducks });
    mockQuery('user', { include: ['chipmunks'] }).returns({ models: chipmunks });

    set(this, 'query', { include: ['ducks'] });

    // ACT
    await this.render(hbs`
      {{#data-provider "user" 
        query=query
        as |dp|
      }}
        <ul class="list">
          {{#each dp.data as |u|}}
            <li class="user-name">{{u.firstName}}</li>
          {{/each}}
        </ul>
      {{/data-provider}}
    `);

    // ASSERT
    await waitForElement('.list', 5000);
    assert.equal(this.$('.user-name:nth-child(1)').text(), 'Huey');
    assert.equal(this.$('.user-name:nth-child(2)').text(), 'Dewey');
    assert.equal(this.$('.user-name:nth-child(3)').text(), 'Louie');

    // ACT 2
    set(this, 'query', { include: ['chipmunks'] });

    // ASSERT 2
    await waitForElement('.list', 5000);
    assert.equal(this.$('.user-name:nth-child(1)').text(), 'Alvin');
    assert.equal(this.$('.user-name:nth-child(2)').text(), 'Simon');
    assert.equal(this.$('.user-name:nth-child(3)').text(), 'Theodore');
  });

  test('will require a manual refetch if deep query attributes have changed', async function(assert) {
    // ARRANGE
    const ducks = [
      make('user', { firstName: 'Huey' }),
      make('user', { firstName: 'Dewey' }),
      make('user', { firstName: 'Louie' }),
    ];
    const chipmunks = [
      make('user', { firstName: 'Alvin' }),
      make('user', { firstName: 'Simon' }),
      make('user', { firstName: 'Theodore' }),
    ];
    mockQuery('user', { include: ['ducks'] }).returns({ models: ducks });
    mockQuery('user', { include: ['chipmunks'] }).returns({ models: chipmunks });

    set(this, 'query', { include: ['ducks'] });

    // ACT
    await this.render(hbs`
      {{#data-provider "user" 
        query=query
        as |dp|
      }}
        <ul class="list">
          {{#each dp.data as |u|}}
            <li class="user-name">{{u.firstName}}</li>
          {{/each}}
        </ul>
        <button {{action dp.reload}}>
          Reload
        </button>
      {{/data-provider}}
    `);

    // ASSERT
    await waitForElement('.list', 5000);
    assert.equal(this.$('.user-name:nth-child(1)').text(), 'Huey');
    assert.equal(this.$('.user-name:nth-child(2)').text(), 'Dewey');
    assert.equal(this.$('.user-name:nth-child(3)').text(), 'Louie');

    // ACT 2
    set(this, 'query.include', ['chipmunks']);
    this.$('button').click();

    // ASSERT 2
    await waitForElement('.list', 5000);
    assert.equal(this.$('.user-name:nth-child(1)').text(), 'Alvin');
    assert.equal(this.$('.user-name:nth-child(2)').text(), 'Simon');
    assert.equal(this.$('.user-name:nth-child(3)').text(), 'Theodore');
  });

  test('should be able to "findRecord" one given a record ID', async function(assert) {
    // ARRANGE
    const user = build('user', { firstName: 'Daffy' });
    mockFindRecord('user').returns({ json: user });

    // ACT
    await this.render(hbs`
      {{#data-provider "user" "1" "findRecord" as |dp| }}
        <div class="user-name">{{dp.data.firstName}}</div>
      {{/data-provider}}
    `);

    // ASSERT
    assert.equal(this.$('.user-name').text(), 'Daffy');
  });

  test('should be able to query with "query" hash as fetch data', async function(assert) {
    // ARRANGE
    const users = [
      make('user', { firstName: 'Alvin' }),
      make('user', { firstName: 'Simon' }),
      make('user', { firstName: 'Theodore' }),
    ];
    mockQuery('user', { type: 'chipmunks' }).returns({ models: users });

    // ACT
    await this.render(hbs`
      {{#data-provider "user"
        query=(hash type="chipmunks")
        as |dp|
      }}
        {{#each dp.data as |u|}}
          <div class="user-name">{{u.firstName}}</div>
        {{/each}}
      {{/data-provider}}
    `);

    // ASSERT
    assert.equal(this.$('.user-name:nth-child(1)').text(), 'Alvin');
    assert.equal(this.$('.user-name:nth-child(2)').text(), 'Simon');
    assert.equal(this.$('.user-name:nth-child(3)').text(), 'Theodore');
  });

  test('should be able to reload latest dataset using "dp.reload" method', async function(assert) {
    // ARRANGE 1
    const users = [
      make('user', { firstName: 'Alvin' }),
      make('user', { firstName: 'Simon' }),
      make('user', { firstName: 'Theodore' }),
    ];
    const mock = mockQuery('user', { type: 'chipmunks' }).returns({ models: users });

    // ACT 1
    await this.render(hbs`
      {{#data-provider "user"
        query=(hash type="chipmunks")
        as |dp|
      }}
        <div class="list">
          {{#each dp.data as |u|}}
            <div class="user-name">{{u.firstName}}</div>
          {{/each}}
          <button class="reload" {{action dp.reload}}>
            Reload
          </button>
        </div>
      {{/data-provider}}
    `);

    // ASSERT 1
    assert.equal(this.$('.user-name').length, 3);
    assert.equal(this.$('.user-name:nth-child(1)').text(), 'Alvin');
    assert.equal(this.$('.user-name:nth-child(2)').text(), 'Simon');
    assert.equal(this.$('.user-name:nth-child(3)').text(), 'Theodore');

    // ARRANGE 2 - Add a user to the list
    const addtlUsers = [...users, make('user', { firstName: 'Brittany' })];
    mock.returns({ models: addtlUsers });

    // ACT 2 - Reload button
    this.$('.reload').click();
    await waitForElement('.list', 5000);

    // ASSERT 2
    assert.equal(this.$('.user-name').length, 4);
    assert.equal(this.$('.user-name:nth-child(4)').text(), 'Brittany');
  });

  test('should be able to spit out errors through "dp.errors"', async function(assert) {
    // ARRANGE - put data straight into store
    mockFindAll('user').fails({
      status: 422,

      response: {
        errors: {
          description: 'Server Error',
        },
      },
    });

    // ACT
    await this.render(hbs`
      {{#data-provider "user"
        storeMethod="findAll"
        as |dp|
      }}
        {{#each dp.data as |u|}}
          <div class="user-name">{{u.firstName}}</div>
        {{/each}}

        <div class="errors">
          {{dp.errors.firstObject.detail}}
        </div>
      {{/data-provider}}
    `);

    // ASSERT
    assert.equal(this.$('.errors').text().trim(), 'Server Error');
  });
});
