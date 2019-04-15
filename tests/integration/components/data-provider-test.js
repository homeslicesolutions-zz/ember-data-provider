import { module, test } from 'qunit';
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
import { waitForElement } from '../../helpers/wait-for';

module('Integration | Component | data-provider', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    manualSetup(this);
  });

  test('should make query and provide a collection of data (positional params)', async function(assert) {
    // ARRANGE
    let users = [
      make('user', { name: 'Huey' }),
      make('user', { name: 'Dewey' }),
      make('user', { name: 'Louie' }),
    ];
    mockFindAll('user').returns({ models: users });

    // ACT
    await this.render(hbs`
      {{#data-provider
        modelName="user"
        as |dp|
      }}
        {{#each dp.data as |user|}}
          <div class="user-name">{{user.name}}</div>
        {{/each}}
      {{/data-provider}}
    `);

    // ASSERT
    assert.dom('.user-name:nth-child(1)').hasText('Huey');
    assert.dom('.user-name:nth-child(2)').hasText('Dewey');
    assert.dom('.user-name:nth-child(3)').hasText('Louie');
  });

  test('should refetch if attributes have changed', async function(assert) {
    // ARRANGE
    const ducks = [
      make('user', { name: 'Huey' }),
      make('user', { name: 'Dewey' }),
      make('user', { name: 'Louie' }),
    ];
    const chipmunks = [
      make('user', { name: 'Alvin' }),
      make('user', { name: 'Simon' }),
      make('user', { name: 'Theodore' }),
    ];
    mockQuery('user', { type: 'ducks' }).returns({ models: ducks });
    mockQuery('user', { type: 'chipmunks' }).returns({ models: chipmunks });

    this.set('query', { type: 'ducks' });

    // ACT
    await this.render(hbs`
      {{#data-provider
        modelName="user"
        storeMethod="query"
        query=query
        as |dp|
      }}
        <ul class="list">
          {{#each dp.data as |u|}}
            <li class="user-name">{{u.name}}</li>
          {{/each}}
        </ul>
      {{/data-provider}}
    `);

    // ASSERT
    await waitForElement('.list', 5000);
    assert.dom('.user-name:nth-child(1)').hasText('Huey');
    assert.dom('.user-name:nth-child(2)').hasText('Dewey');
    assert.dom('.user-name:nth-child(3)').hasText('Louie');

    // ACT 2
    this.set('query', { type: 'chipmunks' });

    // ASSERT 2
    await waitForElement('.list', 5000);
    assert.dom('.user-name:nth-child(1)').hasText('Alvin');
    assert.dom('.user-name:nth-child(2)').hasText('Simon');
    assert.dom('.user-name:nth-child(3)').hasText('Theodore');
  });

  test('will require a manual refetch if deep query attributes have changed', async function(assert) {
    // ARRANGE
    const ducks = [
      make('user', { name: 'Huey' }),
      make('user', { name: 'Dewey' }),
      make('user', { name: 'Louie' }),
    ];
    const chipmunks = [
      make('user', { name: 'Alvin' }),
      make('user', { name: 'Simon' }),
      make('user', { name: 'Theodore' }),
    ];
    mockQuery('user', { include: 'ducks' }).returns({ models: ducks });
    mockQuery('user', { include: 'chipmunks' }).returns({ models: chipmunks });

    this.set('query', { include: 'ducks' });

    // ACT
    await this.render(hbs`
      {{#data-provider "user"
        storeMethod="query"
        query=query
        as |dp|
      }}
        <ul class="list">
          {{#each dp.data as |u|}}
            <li class="user-name">{{u.name}}</li>
          {{/each}}
        </ul>
        <button 
          class="dp-reload"
          {{action dp.reload}}
        >
          Reload
        </button>
      {{/data-provider}}
    `);

    // ASSERT
    await waitForElement('.list', 5000);
    assert.dom('.user-name:nth-child(1)').hasText('Huey');
    assert.dom('.user-name:nth-child(2)').hasText('Dewey');
    assert.dom('.user-name:nth-child(3)').hasText('Louie');

    // ACT 2
    this.set('query.include', 'chipmunks');
    document.querySelector('.dp-reload').click();

    // ASSERT 2
    await waitForElement('.list', 5000);
    assert.dom('.user-name:nth-child(1)').hasText('Alvin');
    assert.dom('.user-name:nth-child(2)').hasText('Simon');
    assert.dom('.user-name:nth-child(3)').hasText('Theodore');
  });

  test('should provide data to using different store method (peekAll)', async function(assert) {
    // ARRANGE - put data straight into store
    make('user', { name: 'Huey' });
    make('user', { name: 'Dewey' });
    make('user', { name: 'Louie' });

    // ACT
    await this.render(hbs`
      {{#data-provider
        modelName="user"
        storeMethod="peekAll"
        as |dp|
      }}
        {{#each dp.data as |u|}}
          <div class="user-name">{{u.name}}</div>
        {{/each}}
      {{/data-provider}}
    `);

    // ASSERT
    assert.dom('.user-name:nth-child(1)').hasText('Huey');
    assert.dom('.user-name:nth-child(2)').hasText('Dewey');
    assert.dom('.user-name:nth-child(3)').hasText('Louie');
  });

  test('should be able to "findRecord" one given a record ID', async function(assert) {
    // ARRANGE
    const user = build('user', { name: 'Daffy' });
    mockFindRecord('user').returns({ json: user });

    // ACT
    await this.render(hbs`
      {{#data-provider
        modelName="user"
        recordId="1"
        storeMethod="findRecord"
        as |dp|
      }}
        <div class="user-name">{{dp.data.name}}</div>
      {{/data-provider}}
    `);

    // ASSERT
    assert.dom('.user-name').hasText('Daffy');
  });

  test('should be able to query with "query" hash as fetch data', async function(assert) {
    // ARRANGE
    const users = [
      make('user', { name: 'Alvin' }),
      make('user', { name: 'Simon' }),
      make('user', { name: 'Theodore' }),
    ];
    mockQuery('user', { type: 'chipmunks' }).returns({ models: users });

    // ACT
    await this.render(hbs`
      {{#data-provider "user"
        storeMethod="query"
        query=(hash type="chipmunks")
        as |dp|
      }}
        <ul class="list">
          {{#each dp.data as |u|}}
            <li class="user-name">{{u.name}}</li>
          {{/each}}
        </ul>
      {{/data-provider}}
    `);

    // ASSERT
    await waitForElement('.list', 5000);
    assert.dom('.user-name:nth-child(1)').hasText('Alvin');
    assert.dom('.user-name:nth-child(2)').hasText('Simon');
    assert.dom('.user-name:nth-child(3)').hasText('Theodore');
  });

  test('should be able to reload latest dataset using "dp.reload" method', async function(assert) {
    // ARRANGE 1
    const users = [
      make('user', { name: 'Alvin' }),
      make('user', { name: 'Simon' }),
      make('user', { name: 'Theodore' }),
    ];
    const mock = mockQuery('user', { type: 'chipmunks' }).returns({ models: users });

    // ACT 1
    await this.render(hbs`
      {{#data-provider "user"
        storeMethod="query"
        query=(hash type="chipmunks")
        as |dp|
      }}
        <div class="list">
          {{#each dp.data as |u|}}
            <div class="user-name">{{u.name}}</div>
          {{/each}}
          <button class="dp-reload" {{action dp.reload}}>
            Reload
          </button>
        </div>
      {{/data-provider}}
    `);

    // ASSERT 1
    await waitForElement('.list', 5000);
    assert.dom('.user-name').exists({ count: 3 });
    assert.dom('.user-name:nth-child(1)').hasText('Alvin');
    assert.dom('.user-name:nth-child(2)').hasText('Simon');
    assert.dom('.user-name:nth-child(3)').hasText('Theodore');

    // ARRANGE 2 - Add a user to the list
    const addtlUsers = [...users, make('user', { name: 'Brittany' })];
    mock.returns({ models: addtlUsers });

    // ACT 2 - Reload button
    document.querySelector('.dp-reload').click();

    // ASSERT 2
    await waitForElement('.list', 5000);
    assert.dom('.user-name').exists({ count: 4 });
    assert.dom('.user-name:nth-child(4)').hasText('Brittany');
  });
});
