import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import hbs from 'htmlbars-inline-precompile';

export default Component.extend({
  store: service(),

  tagName: '',

  modelName:   '',
  recordId:    null,
  storeMethod: null,
  query:       null,
  options:     null,
  throwError:  false,

  isLoading: false,
  data:      computed(function() { return !this.recordId ? [] : null; }),
  errors:    computed(function() { return []; }),

  /**
   * Returning the inferred store method by query and record ID Properties
   * @returns {String:[query,queryRecord,findRecord,findAll]}
   */
  inferredStoreMethod: computed('query,recordId', function() {
    if (this.query) {
      return this.recordId ? 'queryRecord' : 'query';
    }

    return this.recordId ? 'findRecord' : 'findAll';
  }),

  didReceiveAttrs() {
    this.send('fetch');
  },

  actions: {
    async fetch() {
      // If there isn't a specified modelName, then don't run this
      if (!this.modelName) return;
  
      // Set loading
      this.set('isLoading', true);

      // Store Method
      const storeMethod = this.storeMethod || this.inferredStoreMethod;
  
      // Format correct method signature if they have a "recordId"
      const args = [this.modelName];
      if (this.recordId) args.push(this.recordId);
      if (this.query) args.push(this.query);
      if (this.options) args.push(this.options);
  
      // Dispatch fetch action
      try {
        const data = await this.store[storeMethod](...args);
        
        this.set('data', data);
      } catch(e) {
        this.set('errors', e.errors || e);

        if (this.throwError) {
          throw e;
        } else {
          /* eslint no-console: 0 */
          console.error('DataProviderError', e);
        }
      }
      
      this.set('isLoading', false);
    },
  },

  layout: hbs`
    {{#if isLoading}}
      Loading...
    {{else}}
      {{yield (hash 
        data=data
        errors=errors
        reload=(action "fetch")
      )}}
    {{/if}}
  `
}).reopenClass({
  positionalParams: ['modelName', 'recordId'],
})
