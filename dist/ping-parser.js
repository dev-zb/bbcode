'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.PingParser = exports.PingNode = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _nodes = require('./nodes');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PingNode = function (_VoidNode) {
    _inherits(PingNode, _VoidNode);

    _createClass(PingNode, null, [{
        key: 'add_format',
        value: function add_format(fmt) {
            PingNode.formats.set(fmt.name, fmt);
        }
    }]);

    function PingNode(name) {
        _classCallCheck(this, PingNode);

        var _this = _possibleConstructorReturn(this, (PingNode.__proto__ || Object.getPrototypeOf(PingNode)).call(this));

        _this.name = name;
        return _this;
    }

    _createClass(PingNode, [{
        key: 'format',
        value: function format(_format) {
            if (PingNode.formats.has(_format)) {
                return PingNode.formats.get(_format).format(this.name);
            }

            return '@' + this.name;
        }
    }]);

    return PingNode;
}(VoidNode);

exports.PingNode = PingNode;
PingNode.formats = new Map();

var PingParser = exports.PingParser = function (_NodeParser) {
    _inherits(PingParser, _NodeParser);

    function PingParser() {
        _classCallCheck(this, PingParser);

        return _possibleConstructorReturn(this, (PingParser.__proto__ || Object.getPrototypeOf(PingParser)).call(this, '@'));
    }

    _createClass(PingParser, [{
        key: 'parse',
        value: function parse(itr, parser) {
            if (itr.value !== '@') return null;
            itr.next();

            var name = parser.identifier_parse(itr);
            if (!name || !name.length) return null;

            return new PingNode(name);
        }
    }]);

    return PingParser;
}(_nodes.NodeParser);