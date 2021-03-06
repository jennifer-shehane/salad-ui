'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mergeStyles = undefined;

var _stylesheet = require('../../../lib/stylesheet/stylesheet');

var _stylesheet2 = _interopRequireDefault(_stylesheet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var styles = {
  button: {
    cursor: 'pointer',
    color: 'white',
    boxShadow: '1px 1px 0 1px rgba(0,0,0,0.02)',
    position: 'relative',
    verticalAlign: 'middle',
    display: 'inline-block',
    lineHeight: 1,
    borderWidth: 0,
    outline: 'none',
    textAlign: 'center',
    borderRadius: 3,
    top: 0
  },
  buttonHover: {
    top: 1,
    boxShadow: 'inset 1px 1px 0 1px rgba(0,0,0,0.02)'
  },
  buttonLoading: {},
  buttonDisabled: {
    cursor: 'not-allowed',
    opacity: '0.5'
  },
  primary: {
    backgroundColor: _stylesheet.defaults.colors.dmBrand
  },
  primaryHover: {},
  success: {
    backgroundColor: _stylesheet.defaults.colors.green
  },
  successHover: {},
  default: {
    color: _stylesheet.defaults.colors.gray2,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: _stylesheet.defaults.colors.gray4,
    backgroundColor: 'white'
  },
  defaultHover: {
    backgroundColor: 'fefefe'
  },
  sm: {
    padding: '5px 10px'
  },
  md: {
    padding: '9px 14px'
  },
  lg: {
    padding: '16px 22px'
  },
  fullWidth: {
    display: 'block'
  }
};
var mergeStyles = exports.mergeStyles = _stylesheet2.default.all;

exports.default = styles;