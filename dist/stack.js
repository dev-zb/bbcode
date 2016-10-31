'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var stack = exports.stack = function () {
    function stack() {
        _classCallCheck(this, stack);

        this._items = [];

        this.push.apply(this, arguments);
    }

    _createClass(stack, [{
        key: 'values',
        value: function values() {
            return this._items;
        }
    }, {
        key: 'entries',
        value: function entries() {
            return this._items;
        }
    }, {
        key: 'clear',
        value: function clear() {
            this._items = [];
        }

        // push collection

    }, {
        key: 'push_col',
        value: function push_col(c) {
            var _this = this;

            var move = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            if (!c) {
                return;
            }

            if (typeof c.forEach === 'function') {
                c.forEach(function (v) {
                    return _this._items.push(v);
                });
            } else {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = c[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var v = _step.value;

                        this._items.push(v);
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
            }

            if (move && typeof c.clear === 'function') {
                c.clear();
            }
        }
    }, {
        key: 'push',
        value: function push() {
            var _items;

            for (var _len = arguments.length, v = Array(_len), _key = 0; _key < _len; _key++) {
                v[_key] = arguments[_key];
            }

            (_items = this._items).push.apply(_items, _toConsumableArray(v.filter(function (v) {
                return v !== undefined && v !== null;
            })));
        }
    }, {
        key: 'pop',
        value: function pop() {
            return this._items.pop();
        }
    }, {
        key: 'forEach',
        value: function forEach(cb) {
            for (var i = 0, e = this.length; i < e; ++i) {
                cb(this._items[i], i, this);
            }
        }
    }, {
        key: 'pop_each',
        value: function pop_each(cb) {
            while (this.size) {
                cb(this.pop(), this);
            }
        }
    }, {
        key: 'peek',
        value: function peek(index) {
            return this._items[index];
        }
    }, {
        key: 'back',
        value: function back() {
            if (this.length) {
                return this._items[this.length - 1];
            }
            return null;
        }
    }, {
        key: 'front',
        value: function front() {
            if (this.length) {
                return this._items[0];
            }
            return null;
        }
    }, {
        key: 'find',
        value: function find(val, compare) {
            var v = void 0;
            for (var i = this.length - 1; i >= 0; --i) {
                v = this._items[i];
                if (compare(val, v)) {
                    return v;
                }
            }
            return null;
        }
    }, {
        key: 'size',
        get: function get() {
            return this.length;
        }
    }, {
        key: 'length',
        get: function get() {
            return this._items.length;
        }
    }]);

    return stack;
}();