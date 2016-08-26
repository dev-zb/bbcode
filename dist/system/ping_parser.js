System.register([], function (_export2, _context2) {
    "use strict";

    return {
        setters: [],
        execute: function () {
            define([], function () {
                'use strict';

                System.register(['./nodes'], function (_export, _context) {
                    "use strict";

                    var NodeParser, PingNode, PingParser;

                    function _classCallCheck(instance, Constructor) {
                        if (!(instance instanceof Constructor)) {
                            throw new TypeError("Cannot call a class as a function");
                        }
                    }

                    function _possibleConstructorReturn(self, call) {
                        if (!self) {
                            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                        }

                        return call && (typeof call === "object" || typeof call === "function") ? call : self;
                    }

                    function _inherits(subClass, superClass) {
                        if (typeof superClass !== "function" && superClass !== null) {
                            throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
                        }

                        subClass.prototype = Object.create(superClass && superClass.prototype, {
                            constructor: {
                                value: subClass,
                                enumerable: false,
                                writable: true,
                                configurable: true
                            }
                        });
                        if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
                    }

                    return {
                        setters: [function (_nodes) {
                            NodeParser = _nodes.NodeParser;
                        }],
                        execute: function () {
                            _export('PingNode', PingNode = function (_VoidNode) {
                                _inherits(PingNode, _VoidNode);

                                PingNode.add_format = function add_format(fmt) {
                                    PingNode.formats.set(fmt.name, fmt);
                                };

                                function PingNode(name) {
                                    _classCallCheck(this, PingNode);

                                    var _this = _possibleConstructorReturn(this, _VoidNode.call(this));

                                    _this.name = name;
                                    return _this;
                                }

                                PingNode.prototype.format = function format(_format) {
                                    if (PingNode.formats.has(_format)) {
                                        return PingNode.formats.get(_format).format(this.name);
                                    }

                                    return '@' + this.name;
                                };

                                return PingNode;
                            }(VoidNode));

                            _export('PingNode', PingNode);

                            PingNode.formats = new Map();

                            _export('PingParser', PingParser = function (_NodeParser) {
                                _inherits(PingParser, _NodeParser);

                                function PingParser() {
                                    _classCallCheck(this, PingParser);

                                    return _possibleConstructorReturn(this, _NodeParser.call(this, '@'));
                                }

                                PingParser.prototype.parse = function parse(itr, parser) {
                                    if (itr.value !== '@') return null;
                                    itr.next();

                                    var name = parser.identifier_parse(itr);
                                    if (!name || !name.length) return null;

                                    return new PingNode(name);
                                };

                                return PingParser;
                            }(NodeParser));

                            _export('PingParser', PingParser);
                        }
                    };
                });
            });
        }
    };
});