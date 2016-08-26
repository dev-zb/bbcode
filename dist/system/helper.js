System.register([], function (_export2, _context2) {
  "use strict";

  return {
    setters: [],
    execute: function () {
      define([], function () {
        "use strict";

        System.register([], function (_export, _context) {
          "use strict";

          function is_array(v) {
            return v instanceof Array;
          }

          _export("is_array", is_array);

          function ensure_array(v) {
            return is_array(v) ? v : [v];
          }

          _export("ensure_array", ensure_array);

          function is_itr(v) {
            return !!v[Symbol.iterator];
          }

          _export("is_itr", is_itr);

          return {
            setters: [],
            execute: function () {}
          };
        });
      });
    }
  };
});