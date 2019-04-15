ember-data-provider
==============================================================================
[build passing] [npm package version] [ember observer] [ember version]

A data provider component using Ember Data store fetching.  


Compatibility
------------------------------------------------------------------------------
* Ember.js v3.0.0 or above
* Ember CLI v3.0.0 or above
* Ember Data v3.0.0 or above


Installation
------------------------------------------------------------------------------
`ember install ember-data-provider` is a ember-cli addon. To install:
```
ember install ember-data-provider
```


Usage
------------------------------------------------------------------------------
This component was created to enable composition of getting data being in the view layer.  To understand the why in this, we must accept that 1) Getting all the data from the route isn't always the case.  2) There is a place for lazy-loading data within components.  3) It is sometimes better to stay focus on essembling components and including data shouldn't and doesn't need to always be in the code-behind.

Simple use:
```
  {{#data-provider "user" as |dp|}}
    {{#each dp.data as |user|}}
      <div>{{user.name}}</div>
    {{/each}}
  {{/data-provider}}
```
This should:
1. Make execute a store call `this.store.findAll("user")` (`findAll` is the default store method)
2. Export the data to `dp.data`
3. Yield the results to the HTML

Another example using query
```
  {{#data-provider "user"
    query=(hash
      type="chipmunks"
    )
    as |dp|
  }}
    {{#each dp.data as |user|}}
      <div>{{user.name}}</div>
    {{/each}}
  {{/data-provider}}
```
This should:
1. Make execute a store call `this.store.query("user", { type: 'chipmunk' })` which probably would make a network call: `fetch('/users?type=chipmunk')`
2. Export the data to `dp.data`
3. Yield the results to the HTML

You can also have more granular control by setting each othe properties
```
  {{#data-provider
    modelName="user"
    storeMethod="query"
    query=(hash
      type="chipmunks"
    )
    as |dp|
  }}
    {{#each dp.data as |user|}}
      <div>{{user.name}}</div>
    {{/each}}
  {{/data-provider}}
```
This does the same as above. Note that this is probably the only way to force the store to run "peekAll" or "peekRecord"


Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
