System.register([], function (_export, _context) {
  "use strict";

  return {
    setters: [],
    execute: function () {
      define([], function () {
        define(["exports"], function (exports) {
          "use strict";

          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.is_array = is_array;
          exports.ensure_array = ensure_array;
          exports.is_itr = is_itr;
          function is_array(v) {
            return v instanceof Array;
          }
          function ensure_array(v) {
            return is_array(v) ? v : [v];
          }
          function is_itr(v) {
            return !!v[Symbol.iterator];
          }
        });
      });
    }
  };
});