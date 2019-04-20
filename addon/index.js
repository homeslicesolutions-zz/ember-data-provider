import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import hbs from 'htmlbars-inline-precompile';

export default Component.extend({
  store: service(),

  tagName: '',

  /**
   * Name of the model type to be fetched
   * i.e. 'user'
   * @type {String}
   */
  modelName: '',

  /**
   * Supporting singular record fetches by a specifying record ID
   * i.e. GET /users/1 => (recordId: 1)
   * @type {String | null}
   */
  recordId: null,

  /**
   * Specifying the exact store method to be used to get the data
   * @type {String:[query, queryRecord, findRecord, findAll, peekAll, peekRecord] | null}
   */
  storeMethod: null,

  /**
   * Query Parameters for "query" and "queryRecord" methods
   * @type {Object | null}
   */
  queryParams: null,

  /**
   * Options for the store method
   * "Optional, may include 'adapterOptions' hash which will be passed to adapter.query"
   * @type {Object | null}
   */
  options: null,

  /**
   * Flag to either throw the error or just log the error into console if the call fails
   * False will just console.error the error into the console but will not halt the application
   * True will halt the application like it normally does
   * @type {Boolean}
   */
  throwError: false,

  /**
   * Callback for data 
   * @param {Object:DS.Model}
   */
  onSuccess: (/* data */) => {},

   /**
   * Callback for errors 
   * @param {Object:Error}
   */
  onError: (/* error */) => {},

  isLoading: false,
  data:      computed(function() { return !this.recordId ? [] : null; }),
  errors:    computed(function() { return []; }),

  /**
   * Inferring the correct method to use based on properties that are passed through
   * this component. Basing on the query and recordId property, the component will
   * infer to use the assumed correct method matching it's signature. This property
   * will be used if no storeMethod property is specified
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

      // Store Method (choose declared method or infer the method)
      const storeMethod = this.storeMethod || this.inferredStoreMethod;
  
      // Format correct method signature based on all properties
      const args = [this.modelName];
      if (this.recordId) args.push(this.recordId);
      if (this.query) args.push(this.query);
      if (this.options) args.push(this.options);
  
      // Dispatch fetch action
      try {
        const data = await this.store[storeMethod](...args);
        this.set('data', data);
        this.onSuccess(data);
      } catch(e) {
        this.set('errors', e.errors || e);

        if (this.throwError) {
          throw e;
        } else {
          /* eslint no-console: 0 */
          console.error('DataProviderError', e);
        }

        this.onError(e);
      }
      
      this.set('isLoading', false);
    },
  },

  layout: hbs`
    {{yield (hash
      isLoading=isLoading
      data=data
      errors=errors
      reload=(action "fetch")
    )}}
  `
}).reopenClass({
  positionalParams: ['modelName', 'recordId'],
})
