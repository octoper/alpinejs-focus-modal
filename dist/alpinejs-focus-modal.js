(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.AlpineFocusModal = factory());
}(this, (function () { 'use strict';

  function findIndex(array, callback) {
    // attempt to use native or polyfilled Array#findIndex first
    if (array.findIndex) {
      return array.findIndex(callback);
    }

    const length = array.length;

    // shortcut if the array is empty
    if (length === 0) {
      return -1;
    }

    // otherwise loop over array
    for (let i = 0; i < length; i++) {
      if (callback(array[i], i, array)) {
        return i;
      }
    }

    return -1;
  }

  // input may be undefined, selector-tring, Node, NodeList, HTMLCollection, array of Nodes
  // yes, to some extent this is a bad replica of jQuery's constructor function
  function nodeArray(input) {
    if (!input) {
      return [];
    }

    if (Array.isArray(input)) {
      return input;
    }

    // instanceof Node - does not work with iframes
    if (input.nodeType !== undefined) {
      return [input];
    }

    if (typeof input === 'string') {
      input = document.querySelectorAll(input);
    }

    if (input.length !== undefined) {
      return [].slice.call(input, 0);
    }

    throw new TypeError('unexpected input ' + String(input));
  }

  function contextToElement({
    context,
    label = 'context-to-element',
    resolveDocument,
    defaultToDocument,
  }) {
    let element = nodeArray(context)[0];

    if (resolveDocument && element && element.nodeType === Node.DOCUMENT_NODE) {
      element = element.documentElement;
    }

    if (!element && defaultToDocument) {
      return document.documentElement;
    }

    if (!element) {
      throw new TypeError(label + ' requires valid options.context');
    }

    if (element.nodeType !== Node.ELEMENT_NODE && element.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) {
      throw new TypeError(label + ' requires options.context to be an Element');
    }

    return element;
  }

  // [elem, elem.parent, elem.parent.parent, …, html]
  // will not contain the shadowRoot (DOCUMENT_FRAGMENT_NODE) and shadowHost
  function getParents({context} = {}) {
    const list = [];
    let element = contextToElement({
      label: 'get/parents',
      context,
    });

    while (element) {
      list.push(element);
      // IE does know support parentElement on SVGElement
      element = element.parentNode;
      if (element && element.nodeType !== Node.ELEMENT_NODE) {
        element = null;
      }
    }

    return list;
  }

  // Element.prototype.matches may be available at a different name
  // https://developer.mozilla.org/en/docs/Web/API/Element/matches

  const names = ['matches', 'webkitMatchesSelector', 'mozMatchesSelector', 'msMatchesSelector'];
  let name = null;

  function findMethodName(element) {
    names.some(function(_name) {
      if (!element[_name]) {
        return false;
      }

      name = _name;
      return true;
    });
  }

  function elementMatches(element, selector) {
    if (!name) {
      findMethodName(element);
    }

    return element[name](selector);
  }

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function createCommonjsModule(fn, basedir, module) {
  	return module = {
  		path: basedir,
  		exports: {},
  		require: function (path, base) {
  			return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
  		}
  	}, fn(module, module.exports), module.exports;
  }

  function commonjsRequire () {
  	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
  }

  var platform = createCommonjsModule(function (module, exports) {
  (function() {

    /** Used to determine if values are of the language type `Object`. */
    var objectTypes = {
      'function': true,
      'object': true
    };

    /** Used as a reference to the global object. */
    var root = (objectTypes[typeof window] && window) || this;

    /** Backup possible global object. */
    var oldRoot = root;

    /** Detect free variable `exports`. */
    var freeExports = objectTypes['object'] && exports;

    /** Detect free variable `module`. */
    var freeModule = objectTypes['object'] && module && !module.nodeType && module;

    /** Detect free variable `global` from Node.js or Browserified code and use it as `root`. */
    var freeGlobal = freeExports && freeModule && typeof commonjsGlobal == 'object' && commonjsGlobal;
    if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal || freeGlobal.self === freeGlobal)) {
      root = freeGlobal;
    }

    /**
     * Used as the maximum length of an array-like object.
     * See the [ES6 spec](http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength)
     * for more details.
     */
    var maxSafeInteger = Math.pow(2, 53) - 1;

    /** Regular expression to detect Opera. */
    var reOpera = /\bOpera/;

    /** Possible global object. */
    var thisBinding = this;

    /** Used for native method references. */
    var objectProto = Object.prototype;

    /** Used to check for own properties of an object. */
    var hasOwnProperty = objectProto.hasOwnProperty;

    /** Used to resolve the internal `[[Class]]` of values. */
    var toString = objectProto.toString;

    /*--------------------------------------------------------------------------*/

    /**
     * Capitalizes a string value.
     *
     * @private
     * @param {string} string The string to capitalize.
     * @returns {string} The capitalized string.
     */
    function capitalize(string) {
      string = String(string);
      return string.charAt(0).toUpperCase() + string.slice(1);
    }

    /**
     * A utility function to clean up the OS name.
     *
     * @private
     * @param {string} os The OS name to clean up.
     * @param {string} [pattern] A `RegExp` pattern matching the OS name.
     * @param {string} [label] A label for the OS.
     */
    function cleanupOS(os, pattern, label) {
      // Platform tokens are defined at:
      // http://msdn.microsoft.com/en-us/library/ms537503(VS.85).aspx
      // http://web.archive.org/web/20081122053950/http://msdn.microsoft.com/en-us/library/ms537503(VS.85).aspx
      var data = {
        '10.0': '10',
        '6.4':  '10 Technical Preview',
        '6.3':  '8.1',
        '6.2':  '8',
        '6.1':  'Server 2008 R2 / 7',
        '6.0':  'Server 2008 / Vista',
        '5.2':  'Server 2003 / XP 64-bit',
        '5.1':  'XP',
        '5.01': '2000 SP1',
        '5.0':  '2000',
        '4.0':  'NT',
        '4.90': 'ME'
      };
      // Detect Windows version from platform tokens.
      if (pattern && label && /^Win/i.test(os) && !/^Windows Phone /i.test(os) &&
          (data = data[/[\d.]+$/.exec(os)])) {
        os = 'Windows ' + data;
      }
      // Correct character case and cleanup string.
      os = String(os);

      if (pattern && label) {
        os = os.replace(RegExp(pattern, 'i'), label);
      }

      os = format(
        os.replace(/ ce$/i, ' CE')
          .replace(/\bhpw/i, 'web')
          .replace(/\bMacintosh\b/, 'Mac OS')
          .replace(/_PowerPC\b/i, ' OS')
          .replace(/\b(OS X) [^ \d]+/i, '$1')
          .replace(/\bMac (OS X)\b/, '$1')
          .replace(/\/(\d)/, ' $1')
          .replace(/_/g, '.')
          .replace(/(?: BePC|[ .]*fc[ \d.]+)$/i, '')
          .replace(/\bx86\.64\b/gi, 'x86_64')
          .replace(/\b(Windows Phone) OS\b/, '$1')
          .replace(/\b(Chrome OS \w+) [\d.]+\b/, '$1')
          .split(' on ')[0]
      );

      return os;
    }

    /**
     * An iteration utility for arrays and objects.
     *
     * @private
     * @param {Array|Object} object The object to iterate over.
     * @param {Function} callback The function called per iteration.
     */
    function each(object, callback) {
      var index = -1,
          length = object ? object.length : 0;

      if (typeof length == 'number' && length > -1 && length <= maxSafeInteger) {
        while (++index < length) {
          callback(object[index], index, object);
        }
      } else {
        forOwn(object, callback);
      }
    }

    /**
     * Trim and conditionally capitalize string values.
     *
     * @private
     * @param {string} string The string to format.
     * @returns {string} The formatted string.
     */
    function format(string) {
      string = trim(string);
      return /^(?:webOS|i(?:OS|P))/.test(string)
        ? string
        : capitalize(string);
    }

    /**
     * Iterates over an object's own properties, executing the `callback` for each.
     *
     * @private
     * @param {Object} object The object to iterate over.
     * @param {Function} callback The function executed per own property.
     */
    function forOwn(object, callback) {
      for (var key in object) {
        if (hasOwnProperty.call(object, key)) {
          callback(object[key], key, object);
        }
      }
    }

    /**
     * Gets the internal `[[Class]]` of a value.
     *
     * @private
     * @param {*} value The value.
     * @returns {string} The `[[Class]]`.
     */
    function getClassOf(value) {
      return value == null
        ? capitalize(value)
        : toString.call(value).slice(8, -1);
    }

    /**
     * Host objects can return type values that are different from their actual
     * data type. The objects we are concerned with usually return non-primitive
     * types of "object", "function", or "unknown".
     *
     * @private
     * @param {*} object The owner of the property.
     * @param {string} property The property to check.
     * @returns {boolean} Returns `true` if the property value is a non-primitive, else `false`.
     */
    function isHostType(object, property) {
      var type = object != null ? typeof object[property] : 'number';
      return !/^(?:boolean|number|string|undefined)$/.test(type) &&
        (type == 'object' ? !!object[property] : true);
    }

    /**
     * Prepares a string for use in a `RegExp` by making hyphens and spaces optional.
     *
     * @private
     * @param {string} string The string to qualify.
     * @returns {string} The qualified string.
     */
    function qualify(string) {
      return String(string).replace(/([ -])(?!$)/g, '$1?');
    }

    /**
     * A bare-bones `Array#reduce` like utility function.
     *
     * @private
     * @param {Array} array The array to iterate over.
     * @param {Function} callback The function called per iteration.
     * @returns {*} The accumulated result.
     */
    function reduce(array, callback) {
      var accumulator = null;
      each(array, function(value, index) {
        accumulator = callback(accumulator, value, index, array);
      });
      return accumulator;
    }

    /**
     * Removes leading and trailing whitespace from a string.
     *
     * @private
     * @param {string} string The string to trim.
     * @returns {string} The trimmed string.
     */
    function trim(string) {
      return String(string).replace(/^ +| +$/g, '');
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a new platform object.
     *
     * @memberOf platform
     * @param {Object|string} [ua=navigator.userAgent] The user agent string or
     *  context object.
     * @returns {Object} A platform object.
     */
    function parse(ua) {

      /** The environment context object. */
      var context = root;

      /** Used to flag when a custom context is provided. */
      var isCustomContext = ua && typeof ua == 'object' && getClassOf(ua) != 'String';

      // Juggle arguments.
      if (isCustomContext) {
        context = ua;
        ua = null;
      }

      /** Browser navigator object. */
      var nav = context.navigator || {};

      /** Browser user agent string. */
      var userAgent = nav.userAgent || '';

      ua || (ua = userAgent);

      /** Used to flag when `thisBinding` is the [ModuleScope]. */
      var isModuleScope = isCustomContext || thisBinding == oldRoot;

      /** Used to detect if browser is like Chrome. */
      var likeChrome = isCustomContext
        ? !!nav.likeChrome
        : /\bChrome\b/.test(ua) && !/internal|\n/i.test(toString.toString());

      /** Internal `[[Class]]` value shortcuts. */
      var objectClass = 'Object',
          airRuntimeClass = isCustomContext ? objectClass : 'ScriptBridgingProxyObject',
          enviroClass = isCustomContext ? objectClass : 'Environment',
          javaClass = (isCustomContext && context.java) ? 'JavaPackage' : getClassOf(context.java),
          phantomClass = isCustomContext ? objectClass : 'RuntimeObject';

      /** Detect Java environments. */
      var java = /\bJava/.test(javaClass) && context.java;

      /** Detect Rhino. */
      var rhino = java && getClassOf(context.environment) == enviroClass;

      /** A character to represent alpha. */
      var alpha = java ? 'a' : '\u03b1';

      /** A character to represent beta. */
      var beta = java ? 'b' : '\u03b2';

      /** Browser document object. */
      var doc = context.document || {};

      /**
       * Detect Opera browser (Presto-based).
       * http://www.howtocreate.co.uk/operaStuff/operaObject.html
       * http://dev.opera.com/articles/view/opera-mini-web-content-authoring-guidelines/#operamini
       */
      var opera = context.operamini || context.opera;

      /** Opera `[[Class]]`. */
      var operaClass = reOpera.test(operaClass = (isCustomContext && opera) ? opera['[[Class]]'] : getClassOf(opera))
        ? operaClass
        : (opera = null);

      /*------------------------------------------------------------------------*/

      /** Temporary variable used over the script's lifetime. */
      var data;

      /** The CPU architecture. */
      var arch = ua;

      /** Platform description array. */
      var description = [];

      /** Platform alpha/beta indicator. */
      var prerelease = null;

      /** A flag to indicate that environment features should be used to resolve the platform. */
      var useFeatures = ua == userAgent;

      /** The browser/environment version. */
      var version = useFeatures && opera && typeof opera.version == 'function' && opera.version();

      /** A flag to indicate if the OS ends with "/ Version" */
      var isSpecialCasedOS;

      /* Detectable layout engines (order is important). */
      var layout = getLayout([
        { 'label': 'EdgeHTML', 'pattern': 'Edge' },
        'Trident',
        { 'label': 'WebKit', 'pattern': 'AppleWebKit' },
        'iCab',
        'Presto',
        'NetFront',
        'Tasman',
        'KHTML',
        'Gecko'
      ]);

      /* Detectable browser names (order is important). */
      var name = getName([
        'Adobe AIR',
        'Arora',
        'Avant Browser',
        'Breach',
        'Camino',
        'Epiphany',
        'Fennec',
        'Flock',
        'Galeon',
        'GreenBrowser',
        'iCab',
        'Iceweasel',
        'K-Meleon',
        'Konqueror',
        'Lunascape',
        'Maxthon',
        { 'label': 'Microsoft Edge', 'pattern': 'Edge' },
        'Midori',
        'Nook Browser',
        'PaleMoon',
        'PhantomJS',
        'Raven',
        'Rekonq',
        'RockMelt',
        'SeaMonkey',
        { 'label': 'Silk', 'pattern': '(?:Cloud9|Silk-Accelerated)' },
        'Sleipnir',
        'SlimBrowser',
        { 'label': 'SRWare Iron', 'pattern': 'Iron' },
        'Sunrise',
        'Swiftfox',
        'WebPositive',
        'Opera Mini',
        { 'label': 'Opera Mini', 'pattern': 'OPiOS' },
        'Opera',
        { 'label': 'Opera', 'pattern': 'OPR' },
        'Chrome',
        { 'label': 'Chrome Mobile', 'pattern': '(?:CriOS|CrMo)' },
        { 'label': 'Firefox', 'pattern': '(?:Firefox|Minefield)' },
        { 'label': 'Firefox for iOS', 'pattern': 'FxiOS' },
        { 'label': 'IE', 'pattern': 'IEMobile' },
        { 'label': 'IE', 'pattern': 'MSIE' },
        'Safari'
      ]);

      /* Detectable products (order is important). */
      var product = getProduct([
        { 'label': 'BlackBerry', 'pattern': 'BB10' },
        'BlackBerry',
        { 'label': 'Galaxy S', 'pattern': 'GT-I9000' },
        { 'label': 'Galaxy S2', 'pattern': 'GT-I9100' },
        { 'label': 'Galaxy S3', 'pattern': 'GT-I9300' },
        { 'label': 'Galaxy S4', 'pattern': 'GT-I9500' },
        'Google TV',
        'Lumia',
        'iPad',
        'iPod',
        'iPhone',
        'Kindle',
        { 'label': 'Kindle Fire', 'pattern': '(?:Cloud9|Silk-Accelerated)' },
        'Nexus',
        'Nook',
        'PlayBook',
        'PlayStation 3',
        'PlayStation 4',
        'PlayStation Vita',
        'TouchPad',
        'Transformer',
        { 'label': 'Wii U', 'pattern': 'WiiU' },
        'Wii',
        'Xbox One',
        { 'label': 'Xbox 360', 'pattern': 'Xbox' },
        'Xoom'
      ]);

      /* Detectable manufacturers. */
      var manufacturer = getManufacturer({
        'Apple': { 'iPad': 1, 'iPhone': 1, 'iPod': 1 },
        'Archos': {},
        'Amazon': { 'Kindle': 1, 'Kindle Fire': 1 },
        'Asus': { 'Transformer': 1 },
        'Barnes & Noble': { 'Nook': 1 },
        'BlackBerry': { 'PlayBook': 1 },
        'Google': { 'Google TV': 1, 'Nexus': 1 },
        'HP': { 'TouchPad': 1 },
        'HTC': {},
        'LG': {},
        'Microsoft': { 'Xbox': 1, 'Xbox One': 1 },
        'Motorola': { 'Xoom': 1 },
        'Nintendo': { 'Wii U': 1,  'Wii': 1 },
        'Nokia': { 'Lumia': 1 },
        'Samsung': { 'Galaxy S': 1, 'Galaxy S2': 1, 'Galaxy S3': 1, 'Galaxy S4': 1 },
        'Sony': { 'PlayStation 4': 1, 'PlayStation 3': 1, 'PlayStation Vita': 1 }
      });

      /* Detectable operating systems (order is important). */
      var os = getOS([
        'Windows Phone',
        'Android',
        'CentOS',
        { 'label': 'Chrome OS', 'pattern': 'CrOS' },
        'Debian',
        'Fedora',
        'FreeBSD',
        'Gentoo',
        'Haiku',
        'Kubuntu',
        'Linux Mint',
        'OpenBSD',
        'Red Hat',
        'SuSE',
        'Ubuntu',
        'Xubuntu',
        'Cygwin',
        'Symbian OS',
        'hpwOS',
        'webOS ',
        'webOS',
        'Tablet OS',
        'Linux',
        'Mac OS X',
        'Macintosh',
        'Mac',
        'Windows 98;',
        'Windows '
      ]);

      /*------------------------------------------------------------------------*/

      /**
       * Picks the layout engine from an array of guesses.
       *
       * @private
       * @param {Array} guesses An array of guesses.
       * @returns {null|string} The detected layout engine.
       */
      function getLayout(guesses) {
        return reduce(guesses, function(result, guess) {
          return result || RegExp('\\b' + (
            guess.pattern || qualify(guess)
          ) + '\\b', 'i').exec(ua) && (guess.label || guess);
        });
      }

      /**
       * Picks the manufacturer from an array of guesses.
       *
       * @private
       * @param {Array} guesses An object of guesses.
       * @returns {null|string} The detected manufacturer.
       */
      function getManufacturer(guesses) {
        return reduce(guesses, function(result, value, key) {
          // Lookup the manufacturer by product or scan the UA for the manufacturer.
          return result || (
            value[product] ||
            value[/^[a-z]+(?: +[a-z]+\b)*/i.exec(product)] ||
            RegExp('\\b' + qualify(key) + '(?:\\b|\\w*\\d)', 'i').exec(ua)
          ) && key;
        });
      }

      /**
       * Picks the browser name from an array of guesses.
       *
       * @private
       * @param {Array} guesses An array of guesses.
       * @returns {null|string} The detected browser name.
       */
      function getName(guesses) {
        return reduce(guesses, function(result, guess) {
          return result || RegExp('\\b' + (
            guess.pattern || qualify(guess)
          ) + '\\b', 'i').exec(ua) && (guess.label || guess);
        });
      }

      /**
       * Picks the OS name from an array of guesses.
       *
       * @private
       * @param {Array} guesses An array of guesses.
       * @returns {null|string} The detected OS name.
       */
      function getOS(guesses) {
        return reduce(guesses, function(result, guess) {
          var pattern = guess.pattern || qualify(guess);
          if (!result && (result =
                RegExp('\\b' + pattern + '(?:/[\\d.]+|[ \\w.]*)', 'i').exec(ua)
              )) {
            result = cleanupOS(result, pattern, guess.label || guess);
          }
          return result;
        });
      }

      /**
       * Picks the product name from an array of guesses.
       *
       * @private
       * @param {Array} guesses An array of guesses.
       * @returns {null|string} The detected product name.
       */
      function getProduct(guesses) {
        return reduce(guesses, function(result, guess) {
          var pattern = guess.pattern || qualify(guess);
          if (!result && (result =
                RegExp('\\b' + pattern + ' *\\d+[.\\w_]*', 'i').exec(ua) ||
                RegExp('\\b' + pattern + '(?:; *(?:[a-z]+[_-])?[a-z]+\\d+|[^ ();-]*)', 'i').exec(ua)
              )) {
            // Split by forward slash and append product version if needed.
            if ((result = String((guess.label && !RegExp(pattern, 'i').test(guess.label)) ? guess.label : result).split('/'))[1] && !/[\d.]+/.test(result[0])) {
              result[0] += ' ' + result[1];
            }
            // Correct character case and cleanup string.
            guess = guess.label || guess;
            result = format(result[0]
              .replace(RegExp(pattern, 'i'), guess)
              .replace(RegExp('; *(?:' + guess + '[_-])?', 'i'), ' ')
              .replace(RegExp('(' + guess + ')[-_.]?(\\w)', 'i'), '$1 $2'));
          }
          return result;
        });
      }

      /**
       * Resolves the version using an array of UA patterns.
       *
       * @private
       * @param {Array} patterns An array of UA patterns.
       * @returns {null|string} The detected version.
       */
      function getVersion(patterns) {
        return reduce(patterns, function(result, pattern) {
          return result || (RegExp(pattern +
            '(?:-[\\d.]+/|(?: for [\\w-]+)?[ /-])([\\d.]+[^ ();/_-]*)', 'i').exec(ua) || 0)[1] || null;
        });
      }

      /**
       * Returns `platform.description` when the platform object is coerced to a string.
       *
       * @name toString
       * @memberOf platform
       * @returns {string} Returns `platform.description` if available, else an empty string.
       */
      function toStringPlatform() {
        return this.description || '';
      }

      /*------------------------------------------------------------------------*/

      // Convert layout to an array so we can add extra details.
      layout && (layout = [layout]);

      // Detect product names that contain their manufacturer's name.
      if (manufacturer && !product) {
        product = getProduct([manufacturer]);
      }
      // Clean up Google TV.
      if ((data = /\bGoogle TV\b/.exec(product))) {
        product = data[0];
      }
      // Detect simulators.
      if (/\bSimulator\b/i.test(ua)) {
        product = (product ? product + ' ' : '') + 'Simulator';
      }
      // Detect Opera Mini 8+ running in Turbo/Uncompressed mode on iOS.
      if (name == 'Opera Mini' && /\bOPiOS\b/.test(ua)) {
        description.push('running in Turbo/Uncompressed mode');
      }
      // Detect IE Mobile 11.
      if (name == 'IE' && /\blike iPhone OS\b/.test(ua)) {
        data = parse(ua.replace(/like iPhone OS/, ''));
        manufacturer = data.manufacturer;
        product = data.product;
      }
      // Detect iOS.
      else if (/^iP/.test(product)) {
        name || (name = 'Safari');
        os = 'iOS' + ((data = / OS ([\d_]+)/i.exec(ua))
          ? ' ' + data[1].replace(/_/g, '.')
          : '');
      }
      // Detect Kubuntu.
      else if (name == 'Konqueror' && !/buntu/i.test(os)) {
        os = 'Kubuntu';
      }
      // Detect Android browsers.
      else if ((manufacturer && manufacturer != 'Google' &&
          ((/Chrome/.test(name) && !/\bMobile Safari\b/i.test(ua)) || /\bVita\b/.test(product))) ||
          (/\bAndroid\b/.test(os) && /^Chrome/.test(name) && /\bVersion\//i.test(ua))) {
        name = 'Android Browser';
        os = /\bAndroid\b/.test(os) ? os : 'Android';
      }
      // Detect Silk desktop/accelerated modes.
      else if (name == 'Silk') {
        if (!/\bMobi/i.test(ua)) {
          os = 'Android';
          description.unshift('desktop mode');
        }
        if (/Accelerated *= *true/i.test(ua)) {
          description.unshift('accelerated');
        }
      }
      // Detect PaleMoon identifying as Firefox.
      else if (name == 'PaleMoon' && (data = /\bFirefox\/([\d.]+)\b/.exec(ua))) {
        description.push('identifying as Firefox ' + data[1]);
      }
      // Detect Firefox OS and products running Firefox.
      else if (name == 'Firefox' && (data = /\b(Mobile|Tablet|TV)\b/i.exec(ua))) {
        os || (os = 'Firefox OS');
        product || (product = data[1]);
      }
      // Detect false positives for Firefox/Safari.
      else if (!name || (data = !/\bMinefield\b/i.test(ua) && /\b(?:Firefox|Safari)\b/.exec(name))) {
        // Escape the `/` for Firefox 1.
        if (name && !product && /[\/,]|^[^(]+?\)/.test(ua.slice(ua.indexOf(data + '/') + 8))) {
          // Clear name of false positives.
          name = null;
        }
        // Reassign a generic name.
        if ((data = product || manufacturer || os) &&
            (product || manufacturer || /\b(?:Android|Symbian OS|Tablet OS|webOS)\b/.test(os))) {
          name = /[a-z]+(?: Hat)?/i.exec(/\bAndroid\b/.test(os) ? os : data) + ' Browser';
        }
      }
      // Detect non-Opera (Presto-based) versions (order is important).
      if (!version) {
        version = getVersion([
          '(?:Cloud9|CriOS|CrMo|Edge|FxiOS|IEMobile|Iron|Opera ?Mini|OPiOS|OPR|Raven|Silk(?!/[\\d.]+$))',
          'Version',
          qualify(name),
          '(?:Firefox|Minefield|NetFront)'
        ]);
      }
      // Detect stubborn layout engines.
      if ((data =
            layout == 'iCab' && parseFloat(version) > 3 && 'WebKit' ||
            /\bOpera\b/.test(name) && (/\bOPR\b/.test(ua) ? 'Blink' : 'Presto') ||
            /\b(?:Midori|Nook|Safari)\b/i.test(ua) && !/^(?:Trident|EdgeHTML)$/.test(layout) && 'WebKit' ||
            !layout && /\bMSIE\b/i.test(ua) && (os == 'Mac OS' ? 'Tasman' : 'Trident') ||
            layout == 'WebKit' && /\bPlayStation\b(?! Vita\b)/i.test(name) && 'NetFront'
          )) {
        layout = [data];
      }
      // Detect Windows Phone 7 desktop mode.
      if (name == 'IE' && (data = (/; *(?:XBLWP|ZuneWP)(\d+)/i.exec(ua) || 0)[1])) {
        name += ' Mobile';
        os = 'Windows Phone ' + (/\+$/.test(data) ? data : data + '.x');
        description.unshift('desktop mode');
      }
      // Detect Windows Phone 8.x desktop mode.
      else if (/\bWPDesktop\b/i.test(ua)) {
        name = 'IE Mobile';
        os = 'Windows Phone 8.x';
        description.unshift('desktop mode');
        version || (version = (/\brv:([\d.]+)/.exec(ua) || 0)[1]);
      }
      // Detect IE 11.
      else if (name != 'IE' && layout == 'Trident' && (data = /\brv:([\d.]+)/.exec(ua))) {
        if (name) {
          description.push('identifying as ' + name + (version ? ' ' + version : ''));
        }
        name = 'IE';
        version = data[1];
      }
      // Leverage environment features.
      if (useFeatures) {
        // Detect server-side environments.
        // Rhino has a global function while others have a global object.
        if (isHostType(context, 'global')) {
          if (java) {
            data = java.lang.System;
            arch = data.getProperty('os.arch');
            os = os || data.getProperty('os.name') + ' ' + data.getProperty('os.version');
          }
          if (isModuleScope && isHostType(context, 'system') && (data = [context.system])[0]) {
            os || (os = data[0].os || null);
            try {
              data[1] = context.require('ringo/engine').version;
              version = data[1].join('.');
              name = 'RingoJS';
            } catch(e) {
              if (data[0].global.system == context.system) {
                name = 'Narwhal';
              }
            }
          }
          else if (
            typeof context.process == 'object' && !context.process.browser &&
            (data = context.process)
          ) {
            name = 'Node.js';
            arch = data.arch;
            os = data.platform;
            version = /[\d.]+/.exec(data.version)[0];
          }
          else if (rhino) {
            name = 'Rhino';
          }
        }
        // Detect Adobe AIR.
        else if (getClassOf((data = context.runtime)) == airRuntimeClass) {
          name = 'Adobe AIR';
          os = data.flash.system.Capabilities.os;
        }
        // Detect PhantomJS.
        else if (getClassOf((data = context.phantom)) == phantomClass) {
          name = 'PhantomJS';
          version = (data = data.version || null) && (data.major + '.' + data.minor + '.' + data.patch);
        }
        // Detect IE compatibility modes.
        else if (typeof doc.documentMode == 'number' && (data = /\bTrident\/(\d+)/i.exec(ua))) {
          // We're in compatibility mode when the Trident version + 4 doesn't
          // equal the document mode.
          version = [version, doc.documentMode];
          if ((data = +data[1] + 4) != version[1]) {
            description.push('IE ' + version[1] + ' mode');
            layout && (layout[1] = '');
            version[1] = data;
          }
          version = name == 'IE' ? String(version[1].toFixed(1)) : version[0];
        }
        os = os && format(os);
      }
      // Detect prerelease phases.
      if (version && (data =
            /(?:[ab]|dp|pre|[ab]\d+pre)(?:\d+\+?)?$/i.exec(version) ||
            /(?:alpha|beta)(?: ?\d)?/i.exec(ua + ';' + (useFeatures && nav.appMinorVersion)) ||
            /\bMinefield\b/i.test(ua) && 'a'
          )) {
        prerelease = /b/i.test(data) ? 'beta' : 'alpha';
        version = version.replace(RegExp(data + '\\+?$'), '') +
          (prerelease == 'beta' ? beta : alpha) + (/\d+\+?/.exec(data) || '');
      }
      // Detect Firefox Mobile.
      if (name == 'Fennec' || name == 'Firefox' && /\b(?:Android|Firefox OS)\b/.test(os)) {
        name = 'Firefox Mobile';
      }
      // Obscure Maxthon's unreliable version.
      else if (name == 'Maxthon' && version) {
        version = version.replace(/\.[\d.]+/, '.x');
      }
      // Detect Xbox 360 and Xbox One.
      else if (/\bXbox\b/i.test(product)) {
        os = null;
        if (product == 'Xbox 360' && /\bIEMobile\b/.test(ua)) {
          description.unshift('mobile mode');
        }
      }
      // Add mobile postfix.
      else if ((/^(?:Chrome|IE|Opera)$/.test(name) || name && !product && !/Browser|Mobi/.test(name)) &&
          (os == 'Windows CE' || /Mobi/i.test(ua))) {
        name += ' Mobile';
      }
      // Detect IE platform preview.
      else if (name == 'IE' && useFeatures && context.external === null) {
        description.unshift('platform preview');
      }
      // Detect BlackBerry OS version.
      // http://docs.blackberry.com/en/developers/deliverables/18169/HTTP_headers_sent_by_BB_Browser_1234911_11.jsp
      else if ((/\bBlackBerry\b/.test(product) || /\bBB10\b/.test(ua)) && (data =
            (RegExp(product.replace(/ +/g, ' *') + '/([.\\d]+)', 'i').exec(ua) || 0)[1] ||
            version
          )) {
        data = [data, /BB10/.test(ua)];
        os = (data[1] ? (product = null, manufacturer = 'BlackBerry') : 'Device Software') + ' ' + data[0];
        version = null;
      }
      // Detect Opera identifying/masking itself as another browser.
      // http://www.opera.com/support/kb/view/843/
      else if (this != forOwn && product != 'Wii' && (
            (useFeatures && opera) ||
            (/Opera/.test(name) && /\b(?:MSIE|Firefox)\b/i.test(ua)) ||
            (name == 'Firefox' && /\bOS X (?:\d+\.){2,}/.test(os)) ||
            (name == 'IE' && (
              (os && !/^Win/.test(os) && version > 5.5) ||
              /\bWindows XP\b/.test(os) && version > 8 ||
              version == 8 && !/\bTrident\b/.test(ua)
            ))
          ) && !reOpera.test((data = parse.call(forOwn, ua.replace(reOpera, '') + ';'))) && data.name) {
        // When "identifying", the UA contains both Opera and the other browser's name.
        data = 'ing as ' + data.name + ((data = data.version) ? ' ' + data : '');
        if (reOpera.test(name)) {
          if (/\bIE\b/.test(data) && os == 'Mac OS') {
            os = null;
          }
          data = 'identify' + data;
        }
        // When "masking", the UA contains only the other browser's name.
        else {
          data = 'mask' + data;
          if (operaClass) {
            name = format(operaClass.replace(/([a-z])([A-Z])/g, '$1 $2'));
          } else {
            name = 'Opera';
          }
          if (/\bIE\b/.test(data)) {
            os = null;
          }
          if (!useFeatures) {
            version = null;
          }
        }
        layout = ['Presto'];
        description.push(data);
      }
      // Detect WebKit Nightly and approximate Chrome/Safari versions.
      if ((data = (/\bAppleWebKit\/([\d.]+\+?)/i.exec(ua) || 0)[1])) {
        // Correct build number for numeric comparison.
        // (e.g. "532.5" becomes "532.05")
        data = [parseFloat(data.replace(/\.(\d)$/, '.0$1')), data];
        // Nightly builds are postfixed with a "+".
        if (name == 'Safari' && data[1].slice(-1) == '+') {
          name = 'WebKit Nightly';
          prerelease = 'alpha';
          version = data[1].slice(0, -1);
        }
        // Clear incorrect browser versions.
        else if (version == data[1] ||
            version == (data[2] = (/\bSafari\/([\d.]+\+?)/i.exec(ua) || 0)[1])) {
          version = null;
        }
        // Use the full Chrome version when available.
        data[1] = (/\bChrome\/([\d.]+)/i.exec(ua) || 0)[1];
        // Detect Blink layout engine.
        if (data[0] == 537.36 && data[2] == 537.36 && parseFloat(data[1]) >= 28 && layout == 'WebKit') {
          layout = ['Blink'];
        }
        // Detect JavaScriptCore.
        // http://stackoverflow.com/questions/6768474/how-can-i-detect-which-javascript-engine-v8-or-jsc-is-used-at-runtime-in-androi
        if (!useFeatures || (!likeChrome && !data[1])) {
          layout && (layout[1] = 'like Safari');
          data = (data = data[0], data < 400 ? 1 : data < 500 ? 2 : data < 526 ? 3 : data < 533 ? 4 : data < 534 ? '4+' : data < 535 ? 5 : data < 537 ? 6 : data < 538 ? 7 : data < 601 ? 8 : '8');
        } else {
          layout && (layout[1] = 'like Chrome');
          data = data[1] || (data = data[0], data < 530 ? 1 : data < 532 ? 2 : data < 532.05 ? 3 : data < 533 ? 4 : data < 534.03 ? 5 : data < 534.07 ? 6 : data < 534.10 ? 7 : data < 534.13 ? 8 : data < 534.16 ? 9 : data < 534.24 ? 10 : data < 534.30 ? 11 : data < 535.01 ? 12 : data < 535.02 ? '13+' : data < 535.07 ? 15 : data < 535.11 ? 16 : data < 535.19 ? 17 : data < 536.05 ? 18 : data < 536.10 ? 19 : data < 537.01 ? 20 : data < 537.11 ? '21+' : data < 537.13 ? 23 : data < 537.18 ? 24 : data < 537.24 ? 25 : data < 537.36 ? 26 : layout != 'Blink' ? '27' : '28');
        }
        // Add the postfix of ".x" or "+" for approximate versions.
        layout && (layout[1] += ' ' + (data += typeof data == 'number' ? '.x' : /[.+]/.test(data) ? '' : '+'));
        // Obscure version for some Safari 1-2 releases.
        if (name == 'Safari' && (!version || parseInt(version) > 45)) {
          version = data;
        }
      }
      // Detect Opera desktop modes.
      if (name == 'Opera' &&  (data = /\bzbov|zvav$/.exec(os))) {
        name += ' ';
        description.unshift('desktop mode');
        if (data == 'zvav') {
          name += 'Mini';
          version = null;
        } else {
          name += 'Mobile';
        }
        os = os.replace(RegExp(' *' + data + '$'), '');
      }
      // Detect Chrome desktop mode.
      else if (name == 'Safari' && /\bChrome\b/.exec(layout && layout[1])) {
        description.unshift('desktop mode');
        name = 'Chrome Mobile';
        version = null;

        if (/\bOS X\b/.test(os)) {
          manufacturer = 'Apple';
          os = 'iOS 4.3+';
        } else {
          os = null;
        }
      }
      // Strip incorrect OS versions.
      if (version && version.indexOf((data = /[\d.]+$/.exec(os))) == 0 &&
          ua.indexOf('/' + data + '-') > -1) {
        os = trim(os.replace(data, ''));
      }
      // Add layout engine.
      if (layout && !/\b(?:Avant|Nook)\b/.test(name) && (
          /Browser|Lunascape|Maxthon/.test(name) ||
          name != 'Safari' && /^iOS/.test(os) && /\bSafari\b/.test(layout[1]) ||
          /^(?:Adobe|Arora|Breach|Midori|Opera|Phantom|Rekonq|Rock|Sleipnir|Web)/.test(name) && layout[1])) {
        // Don't add layout details to description if they are falsey.
        (data = layout[layout.length - 1]) && description.push(data);
      }
      // Combine contextual information.
      if (description.length) {
        description = ['(' + description.join('; ') + ')'];
      }
      // Append manufacturer to description.
      if (manufacturer && product && product.indexOf(manufacturer) < 0) {
        description.push('on ' + manufacturer);
      }
      // Append product to description.
      if (product) {
        description.push((/^on /.test(description[description.length - 1]) ? '' : 'on ') + product);
      }
      // Parse the OS into an object.
      if (os) {
        data = / ([\d.+]+)$/.exec(os);
        isSpecialCasedOS = data && os.charAt(os.length - data[0].length - 1) == '/';
        os = {
          'architecture': 32,
          'family': (data && !isSpecialCasedOS) ? os.replace(data[0], '') : os,
          'version': data ? data[1] : null,
          'toString': function() {
            var version = this.version;
            return this.family + ((version && !isSpecialCasedOS) ? ' ' + version : '') + (this.architecture == 64 ? ' 64-bit' : '');
          }
        };
      }
      // Add browser/OS architecture.
      if ((data = /\b(?:AMD|IA|Win|WOW|x86_|x)64\b/i.exec(arch)) && !/\bi686\b/i.test(arch)) {
        if (os) {
          os.architecture = 64;
          os.family = os.family.replace(RegExp(' *' + data), '');
        }
        if (
            name && (/\bWOW64\b/i.test(ua) ||
            (useFeatures && /\w(?:86|32)$/.test(nav.cpuClass || nav.platform) && !/\bWin64; x64\b/i.test(ua)))
        ) {
          description.unshift('32-bit');
        }
      }
      // Chrome 39 and above on OS X is always 64-bit.
      else if (
          os && /^OS X/.test(os.family) &&
          name == 'Chrome' && parseFloat(version) >= 39
      ) {
        os.architecture = 64;
      }

      ua || (ua = null);

      /*------------------------------------------------------------------------*/

      /**
       * The platform object.
       *
       * @name platform
       * @type Object
       */
      var platform = {};

      /**
       * The platform description.
       *
       * @memberOf platform
       * @type string|null
       */
      platform.description = ua;

      /**
       * The name of the browser's layout engine.
       *
       * @memberOf platform
       * @type string|null
       */
      platform.layout = layout && layout[0];

      /**
       * The name of the product's manufacturer.
       *
       * @memberOf platform
       * @type string|null
       */
      platform.manufacturer = manufacturer;

      /**
       * The name of the browser/environment.
       *
       * @memberOf platform
       * @type string|null
       */
      platform.name = name;

      /**
       * The alpha/beta release indicator.
       *
       * @memberOf platform
       * @type string|null
       */
      platform.prerelease = prerelease;

      /**
       * The name of the product hosting the browser.
       *
       * @memberOf platform
       * @type string|null
       */
      platform.product = product;

      /**
       * The browser's user agent string.
       *
       * @memberOf platform
       * @type string|null
       */
      platform.ua = ua;

      /**
       * The browser/environment version.
       *
       * @memberOf platform
       * @type string|null
       */
      platform.version = name && version;

      /**
       * The name of the operating system.
       *
       * @memberOf platform
       * @type Object
       */
      platform.os = os || {

        /**
         * The CPU architecture the OS is built for.
         *
         * @memberOf platform.os
         * @type number|null
         */
        'architecture': null,

        /**
         * The family of the OS.
         *
         * Common values include:
         * "Windows", "Windows Server 2008 R2 / 7", "Windows Server 2008 / Vista",
         * "Windows XP", "OS X", "Ubuntu", "Debian", "Fedora", "Red Hat", "SuSE",
         * "Android", "iOS" and "Windows Phone"
         *
         * @memberOf platform.os
         * @type string|null
         */
        'family': null,

        /**
         * The version of the OS.
         *
         * @memberOf platform.os
         * @type string|null
         */
        'version': null,

        /**
         * Returns the OS string.
         *
         * @memberOf platform.os
         * @returns {string} The OS string.
         */
        'toString': function() { return 'null'; }
      };

      platform.parse = parse;
      platform.toString = toStringPlatform;

      if (platform.version) {
        description.unshift(version);
      }
      if (platform.name) {
        description.unshift(name);
      }
      if (os && name && !(os == String(os).split(' ')[0] && (os == name.split(' ')[0] || product))) {
        description.push(product ? '(' + os + ')' : 'on ' + os);
      }
      if (description.length) {
        platform.description = description.join(' ');
      }
      return platform;
    }

    /*--------------------------------------------------------------------------*/

    // Export platform.
    var platform = parse();

    // Some AMD build optimizers, like r.js, check for condition patterns like the following:
    if (freeExports && freeModule) {
      // Export for CommonJS support.
      forOwn(platform, function(value, key) {
        freeExports[key] = value;
      });
    }
    else {
      // Export to the global object.
      root.platform = platform;
    }
  }.call(commonjsGlobal));
  });

  // deep clone of original platform
  const platform$1 = JSON.parse(JSON.stringify(platform));

  // operating system
  const os = platform$1.os.family || '';
  const ANDROID = os === 'Android';
  const WINDOWS = os.slice(0, 7) === 'Windows';
  const OSX = os === 'OS X';
  const IOS = os === 'iOS';

  // layout
  const BLINK = platform$1.layout === 'Blink';
  const GECKO = platform$1.layout === 'Gecko';
  const TRIDENT = platform$1.layout === 'Trident';
  const EDGE = platform$1.layout === 'EdgeHTML';
  const WEBKIT = platform$1.layout === 'WebKit';

  // browser version (not layout engine version!)
  const version = parseFloat(platform$1.version);
  const majorVersion = Math.floor(version);
  platform$1.majorVersion = majorVersion;

  platform$1.is = {
    // operating system
    ANDROID,
    WINDOWS,
    OSX,
    IOS,
    // layout
    BLINK, // "Chrome", "Chrome Mobile", "Opera"
    GECKO, // "Firefox"
    TRIDENT, // "Internet Explorer"
    EDGE, // "Microsoft Edge"
    WEBKIT, // "Safari"
    // INTERNET EXPLORERS
    IE9: TRIDENT && majorVersion === 9,
    IE10: TRIDENT && majorVersion === 10,
    IE11: TRIDENT && majorVersion === 11,
  };

  function before() {
    const data = {
      // remember what had focus to restore after test
      activeElement: document.activeElement,
      // remember scroll positions to restore after test
      windowScrollTop: window.scrollTop,
      windowScrollLeft: window.scrollLeft,
      bodyScrollTop: document.body.scrollTop,
      bodyScrollLeft: document.body.scrollLeft,
    };

    // wrap tests in an element hidden from screen readers to prevent them
    // from announcing focus, which can be quite irritating to the user
    const iframe = document.createElement('iframe');
    iframe.setAttribute('style', 'position:absolute; position:fixed; top:0; left:-2px; width:1px; height:1px; overflow:hidden;');
    iframe.setAttribute('aria-live', 'off');
    iframe.setAttribute('aria-busy', 'true');
    iframe.setAttribute('aria-hidden', 'true');
    document.body.appendChild(iframe);

    const _window = iframe.contentWindow;
    const _document = _window.document;

    _document.open();
    _document.close();
    const wrapper = _document.createElement('div');
    _document.body.appendChild(wrapper);

    data.iframe = iframe;
    data.wrapper = wrapper;
    data.window = _window;
    data.document = _document;

    return data;
  }

  // options.element:
  //  {string} element name
  //  {function} callback(wrapper, document) to generate an element
  // options.mutate: (optional)
  //  {function} callback(element, wrapper, document) to manipulate element prior to focus-test.
  //             Can return DOMElement to define focus target (default: element)
  // options.validate: (optional)
  //  {function} callback(element, focusTarget, document) to manipulate test-result
  function test(data, options) {
    // make sure we operate on a clean slate
    data.wrapper.innerHTML = '';
    // create dummy element to test focusability of
    const element = typeof options.element === 'string'
      ? data.document.createElement(options.element)
      : options.element(data.wrapper, data.document);
    // allow callback to further specify dummy element
    // and optionally define element to focus
    let focus = options.mutate && options.mutate(element, data.wrapper, data.document);
    if (!focus && focus !== false) {
      focus = element;
    }
    // element needs to be part of the DOM to be focusable
    !element.parentNode && data.wrapper.appendChild(element);
    // test if the element with invalid tabindex can be focused
    focus && focus.focus && focus.focus();
    // validate test's result
    return options.validate
      ? options.validate(element, focus, data.document)
      : data.document.activeElement === focus;
  }

  function after(data) {
    // restore focus to what it was before test and cleanup
    if (data.activeElement === document.body) {
      document.activeElement && document.activeElement.blur && document.activeElement.blur();
      if (platform$1.is.IE10) {
        // IE10 does not redirect focus to <body> when the activeElement is removed
        document.body.focus();
      }
    } else {
      data.activeElement && data.activeElement.focus && data.activeElement.focus();
    }

    document.body.removeChild(data.iframe);

    // restore scroll position
    window.scrollTop = data.windowScrollTop;
    window.scrollLeft = data.windowScrollLeft;
    document.body.scrollTop = data.bodyScrollTop;
    document.body.scrollLeft = data.bodyScrollLeft;
  }

  function detectFocus(tests) {
    const data = before();

    const results = {};
    Object.keys(tests).map(function(key) {
      results[key] = test(data, tests[key]);
    });

    after(data);
    return results;
  }

  // this file is overwritten by `npm run build:pre`
  const version$1 = '1.4.1';

  /*
      Facility to cache test results in localStorage.

      USAGE:
        cache.get('key');
        cache.set('key', 'value');
   */

  function readLocalStorage(key) {
    // allow reading from storage to retrieve previous support results
    // even while the document does not have focus
    let data;

    try {
      data = window.localStorage && window.localStorage.getItem(key);
      data = data ? JSON.parse(data) : {};
    } catch (e) {
      data = {};
    }

    return data;
  }

  function writeLocalStorage(key, value) {
    if (!document.hasFocus()) {
      // if the document does not have focus when tests are executed, focus() may
      // not be handled properly and events may not be dispatched immediately.
      // This can happen when a document is reloaded while Developer Tools have focus.
      try {
        window.localStorage && window.localStorage.removeItem(key);
      } catch (e) {
        // ignore
      }

      return;
    }

    try {
      window.localStorage && window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // ignore
    }
  }

  const userAgent = typeof window !== 'undefined' && window.navigator.userAgent || '';
  const cacheKey = 'ally-supports-cache';
  let cache = readLocalStorage(cacheKey);

  // update the cache if ally or the user agent changed (newer version, etc)
  if (cache.userAgent !== userAgent || cache.version !== version$1) {
    cache = {};
  }

  cache.userAgent = userAgent;
  cache.version = version$1;

  var cache$1 = {
    get: function() {
      return cache;
    },
    set: function(values) {
      Object.keys(values).forEach(function(key) {
        cache[key] = values[key];
      });

      cache.time = new Date().toISOString();
      writeLocalStorage(cacheKey, cache);
    },
  };

  function cssShadowPiercingDeepCombinator() {
    let combinator;

    // see https://dev.w3.org/csswg/css-scoping-1/#deep-combinator
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1117572
    // https://code.google.com/p/chromium/issues/detail?id=446051
    try {
      document.querySelector('html >>> :first-child');
      combinator = '>>>';
    } catch (noArrowArrowArrow) {
      try {
        // old syntax supported at least up to Chrome 41
        // https://code.google.com/p/chromium/issues/detail?id=446051
        document.querySelector('html /deep/ :first-child');
        combinator = '/deep/';
      } catch (noDeep) {
        combinator = '';
      }
    }

    return combinator;
  }

  var gif = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#attr-usemap
  var focusAreaImgTabindex = {
    element: 'div',
    mutate: function(element) {
      element.innerHTML = '<map name="image-map-tabindex-test">'
        + '<area shape="rect" coords="63,19,144,45"></map>'
        + '<img usemap="#image-map-tabindex-test" tabindex="-1" alt="" src="' + gif + '">';

      return element.querySelector('area');
    },
  };

  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#attr-usemap
  var focusAreaTabindex = {
    element: 'div',
    mutate: function(element) {
      element.innerHTML = '<map name="image-map-tabindex-test">'
        + '<area href="#void" tabindex="-1" shape="rect" coords="63,19,144,45"></map>'
        + '<img usemap="#image-map-tabindex-test" alt="" src="' + gif + '">';

      return false;
    },
    validate: function(element, focusTarget, _document) {
      if (platform$1.is.GECKO) {
        // fixes https://github.com/medialize/ally.js/issues/35
        // Firefox loads the DataURI asynchronously, causing a false-negative
        return true;
      }

      const focus = element.querySelector('area');
      focus.focus();
      return _document.activeElement === focus;
    },
  };

  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#attr-usemap
  var focusAreaWithoutHref = {
    element: 'div',
    mutate: function(element) {
      element.innerHTML = '<map name="image-map-area-href-test">'
        + '<area shape="rect" coords="63,19,144,45"></map>'
        + '<img usemap="#image-map-area-href-test" alt="" src="' + gif + '">';

      return element.querySelector('area');
    },
    validate: function(element, focusTarget, _document) {
      if (platform$1.is.GECKO) {
        // fixes https://github.com/medialize/ally.js/issues/35
        // Firefox loads the DataURI asynchronously, causing a false-negative
        return true;
      }

      return _document.activeElement === focusTarget;
    },
  };

  var focusAudioWithoutControls = {
    name: 'can-focus-audio-without-controls',
    element: 'audio',
    mutate: function(element) {
      try {
        // invalid media file can trigger warning in console, data-uri to prevent HTTP request
        element.setAttribute('src', gif);
      } catch (e) {
        // IE9 may throw "Error: Not implemented"
      }
    },
  };

  var invalidGif = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ';

  // NOTE: https://github.com/medialize/ally.js/issues/35
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#attr-usemap
  var focusBrokenImageMap = {
    element: 'div',
    mutate: function(element) {
      element.innerHTML = '<map name="broken-image-map-test"><area href="#void" shape="rect" coords="63,19,144,45"></map>'
        + '<img usemap="#broken-image-map-test" alt="" src="' + invalidGif + '">';

      return element.querySelector('area');
    },
  };

  // Children of focusable elements with display:flex are focusable in IE10-11
  var focusChildrenOfFocusableFlexbox = {
    element: 'div',
    mutate: function(element) {
      element.setAttribute('tabindex', '-1');
      element.setAttribute('style', 'display: -webkit-flex; display: -ms-flexbox; display: flex;');
      element.innerHTML = '<span style="display: block;">hello</span>';
      return element.querySelector('span');
    },
  };

  // fieldset[tabindex=0][disabled] should not be focusable, but Blink and WebKit disagree
  // @specification https://www.w3.org/TR/html5/disabled-elements.html#concept-element-disabled
  // @browser-issue Chromium https://crbug.com/453847
  // @browser-issue WebKit https://bugs.webkit.org/show_bug.cgi?id=141086
  var focusFieldsetDisabled = {
    element: 'fieldset',
    mutate: function(element) {
      element.setAttribute('tabindex', 0);
      element.setAttribute('disabled', 'disabled');
    },
  };

  var focusFieldset = {
    element: 'fieldset',
    mutate: function(element) {
      element.innerHTML = '<legend>legend</legend><p>content</p>';
    },
  };

  // elements with display:flex are focusable in IE10-11
  var focusFlexboxContainer = {
    element: 'span',
    mutate: function(element) {
      element.setAttribute('style', 'display: -webkit-flex; display: -ms-flexbox; display: flex;');
      element.innerHTML = '<span style="display: block;">hello</span>';
    },
  };

  // form[tabindex=0][disabled] should be focusable as the
  // specification doesn't know the disabled attribute on the form element
  // @specification https://www.w3.org/TR/html5/forms.html#the-form-element
  var focusFormDisabled = {
    element: 'form',
    mutate: function(element) {
      element.setAttribute('tabindex', 0);
      element.setAttribute('disabled', 'disabled');
    },
  };

  // NOTE: https://github.com/medialize/ally.js/issues/35
  // fixes https://github.com/medialize/ally.js/issues/20
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#attr-ismap
  var focusImgIsmap = {
    element: 'a',
    mutate: function(element) {
      element.href = '#void';
      element.innerHTML = '<img ismap src="' + gif + '" alt="">';
      return element.querySelector('img');
    },
  };

  // NOTE: https://github.com/medialize/ally.js/issues/35
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#attr-usemap
  var focusImgUsemapTabindex = {
    element: 'div',
    mutate: function(element) {
      element.innerHTML = '<map name="image-map-tabindex-test"><area href="#void" shape="rect" coords="63,19,144,45"></map>'
        + '<img usemap="#image-map-tabindex-test" tabindex="-1" alt="" '
        + 'src="' + gif + '">';

      return element.querySelector('img');
    },
  };

  var focusInHiddenIframe = {
    element: function(wrapper, _document) {
      const iframe = _document.createElement('iframe');

      // iframe must be part of the DOM before accessing the contentWindow is possible
      wrapper.appendChild(iframe);

      // create the iframe's default document (<html><head></head><body></body></html>)
      const iframeDocument = iframe.contentWindow.document;
      iframeDocument.open();
      iframeDocument.close();
      return iframe;
    },
    mutate: function(iframe) {
      iframe.style.visibility = 'hidden';

      const iframeDocument = iframe.contentWindow.document;
      const input = iframeDocument.createElement('input');
      iframeDocument.body.appendChild(input);
      return input;
    },
    validate: function(iframe) {
      const iframeDocument = iframe.contentWindow.document;
      const focus = iframeDocument.querySelector('input');
      return iframeDocument.activeElement === focus;
    },
  };

  const result = !platform$1.is.WEBKIT;

  function focusInZeroDimensionObject() {
    return result;
  }

  // Firefox allows *any* value and treats invalid values like tabindex="-1"
  // @browser-issue Gecko https://bugzilla.mozilla.org/show_bug.cgi?id=1128054
  var focusInvalidTabindex = {
    element: 'div',
    mutate: function(element) {
      element.setAttribute('tabindex', 'invalid-value');
    },
  };

  var focusLabelTabindex = {
    element: 'label',
    mutate: function(element) {
      element.setAttribute('tabindex', '-1');
    },
    validate: function(element, focusTarget, _document) {
      // force layout in Chrome 49, otherwise the element won't be focusable
      /* eslint-disable no-unused-vars */
      const variableToPreventDeadCodeElimination = element.offsetHeight;
      /* eslint-enable no-unused-vars */
      element.focus();
      return _document.activeElement === element;
    },
  };

  var svg = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtb'
    + 'G5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBpZD0ic3ZnIj48dGV4dCB4PSIxMCIgeT0iMjAiIGlkPSJ'
    + 'zdmctbGluay10ZXh0Ij50ZXh0PC90ZXh0Pjwvc3ZnPg==';

  // Note: IE10 on BrowserStack does not like this test

  var focusObjectSvgHidden = {
    element: 'object',
    mutate: function(element) {
      element.setAttribute('type', 'image/svg+xml');
      element.setAttribute('data', svg);
      element.setAttribute('width', '200');
      element.setAttribute('height', '50');
      element.style.visibility = 'hidden';
    },
  };

  // Note: IE10 on BrowserStack does not like this test

  var focusObjectSvg = {
    name: 'can-focus-object-svg',
    element: 'object',
    mutate: function(element) {
      element.setAttribute('type', 'image/svg+xml');
      element.setAttribute('data', svg);
      element.setAttribute('width', '200');
      element.setAttribute('height', '50');
    },
    validate: function(element, focusTarget, _document) {
      if (platform$1.is.GECKO) {
        // Firefox seems to be handling the object creation asynchronously and thereby produces a false negative test result.
        // Because we know Firefox is able to focus object elements referencing SVGs, we simply cheat by sniffing the user agent string
        return true;
      }

      return _document.activeElement === element;
    },
  };

  // Every Environment except IE9 considers SWF objects focusable
  const result$1 = !platform$1.is.IE9;

  function focusObjectSwf() {
    return result$1;
  }

  var focusRedirectImgUsemap = {
    element: 'div',
    mutate: function(element) {
      element.innerHTML = '<map name="focus-redirect-img-usemap"><area href="#void" shape="rect" coords="63,19,144,45"></map>'
        + '<img usemap="#focus-redirect-img-usemap" alt="" '
        + 'src="' + gif + '">';

      // focus the <img>, not the <div>
      return element.querySelector('img');
    },
    validate: function(element, focusTarget, _document) {
      const target = element.querySelector('area');
      return _document.activeElement === target;
    },
  };

  // see https://jsbin.com/nenirisage/edit?html,js,console,output

  var focusRedirectLegend = {
    element: 'fieldset',
    mutate: function(element) {
      element.innerHTML = '<legend>legend</legend><input tabindex="-1"><input tabindex="0">';
      // take care of focus in validate();
      return false;
    },
    validate: function(element, focusTarget, _document) {
      const focusable = element.querySelector('input[tabindex="-1"]');
      const tabbable = element.querySelector('input[tabindex="0"]');

      // Firefox requires this test to focus the <fieldset> first, while this is not necessary in
      // https://jsbin.com/nenirisage/edit?html,js,console,output
      element.focus();

      element.querySelector('legend').focus();
      return _document.activeElement === focusable && 'focusable'
        || _document.activeElement === tabbable && 'tabbable'
        || '';
    },
  };

  // https://github.com/medialize/ally.js/issues/21
  var focusScrollBody = {
    element: 'div',
    mutate: function(element) {
      element.setAttribute('style', 'width: 100px; height: 50px; overflow: auto;');
      element.innerHTML = '<div style="width: 500px; height: 40px;">scrollable content</div>';
      return element.querySelector('div');
    },
  };

  // https://github.com/medialize/ally.js/issues/21
  var focusScrollContainerWithoutOverflow = {
    element: 'div',
    mutate: function(element) {
      element.setAttribute('style', 'width: 100px; height: 50px;');
      element.innerHTML = '<div style="width: 500px; height: 40px;">scrollable content</div>';
    },
  };

  // https://github.com/medialize/ally.js/issues/21
  var focusScrollContainer = {
    element: 'div',
    mutate: function(element) {
      element.setAttribute('style', 'width: 100px; height: 50px; overflow: auto;');
      element.innerHTML = '<div style="width: 500px; height: 40px;">scrollable content</div>';
    },
  };

  var focusSummary = {
    element: 'details',
    mutate: function(element) {
      element.innerHTML = '<summary>foo</summary><p>content</p>';
      return element.firstElementChild;
    },
  };

  function makeFocusableForeignObject() {
    const fragment = document.createElement('div');
    fragment.innerHTML = `<svg><foreignObject width="30" height="30">
      <input type="text"/>
  </foreignObject></svg>`;

    return fragment.firstChild.firstChild;
  }

  function focusSvgForeignObjectHack(element) {
    // Edge13, Edge14: foreignObject focus hack
    // https://jsbin.com/kunehinugi/edit?html,js,output
    // https://jsbin.com/fajagi/3/edit?html,js,output
    const isSvgElement = element.ownerSVGElement || element.nodeName.toLowerCase() === 'svg';
    if (!isSvgElement) {
      return false;
    }

    // inject and focus an <input> element into the SVG element to receive focus
    const foreignObject = makeFocusableForeignObject();
    element.appendChild(foreignObject);
    const input = foreignObject.querySelector('input');
    input.focus();

    // upon disabling the activeElement, IE and Edge
    // will not shift focus to <body> like all the other
    // browsers, but instead find the first focusable
    // ancestor and shift focus to that
    input.disabled = true;

    // clean up
    element.removeChild(foreignObject);
    return true;
  }

  function generate(element) {
    return '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">'
      + element + '</svg>';
  }

  function focus(element) {
    if (element.focus) {
      return;
    }

    try {
      HTMLElement.prototype.focus.call(element);
    } catch (e) {
      focusSvgForeignObjectHack(element);
    }
  }

  function validate(element, focusTarget, _document) {
    focus(focusTarget);
    return _document.activeElement === focusTarget;
  }

  var focusSvgFocusableAttribute = {
    element: 'div',
    mutate: function(element) {
      element.innerHTML = generate('<text focusable="true">a</text>');
      return element.querySelector('text');
    },
    validate,
  };

  var focusSvgTabindexAttribute = {
    element: 'div',
    mutate: function(element) {
      element.innerHTML = generate('<text tabindex="0">a</text>');
      return element.querySelector('text');
    },
    validate,
  };

  var focusSvgNegativeTabindexAttribute = {
    element: 'div',
    mutate: function(element) {
      element.innerHTML = generate('<text tabindex="-1">a</text>');
      return element.querySelector('text');
    },
    validate,
  };

  var focusSvgUseTabindex = {
    element: 'div',
    mutate: function(element) {
      element.innerHTML = generate([
        '<g id="ally-test-target"><a xlink:href="#void"><text>link</text></a></g>',
        '<use xlink:href="#ally-test-target" x="0" y="0" tabindex="-1" />',
      ].join(''));

      return element.querySelector('use');
    },
    validate,
  };

  var focusSvgForeignobjectTabindex = {
    element: 'div',
    mutate: function(element) {
      element.innerHTML = generate('<foreignObject tabindex="-1"><input type="text" /></foreignObject>');
      // Safari 8's quersSelector() can't identify foreignObject, but getElementyByTagName() can
      return element.querySelector('foreignObject') || element.getElementsByTagName('foreignObject')[0];
    },
    validate,

  };

  // Firefox seems to be handling the SVG-document-in-iframe creation asynchronously
  // and thereby produces a false negative test result. Thus the test is pointless
  // and we resort to UA sniffing once again.
  // see http://jsbin.com/vunadohoko/1/edit?js,console,output

  const result$2 = Boolean(platform$1.is.GECKO && typeof SVGElement !== 'undefined' && SVGElement.prototype.focus);

  function focusSvgInIframe() {
    return result$2;
  }

  var focusSvg = {
    element: 'div',
    mutate: function(element) {
      element.innerHTML = generate('');
      return element.firstChild;
    },
    validate,
  };

  // Firefox allows *any* value and treats invalid values like tabindex="-1"
  // @browser-issue Gecko https://bugzilla.mozilla.org/show_bug.cgi?id=1128054
  var focusTabindexTrailingCharacters = {
    element: 'div',
    mutate: function(element) {
      element.setAttribute('tabindex', '3x');
    },
  };

  var focusTable = {
    element: 'table',
    mutate: function(element, wrapper, _document) {
      // IE9 has a problem replacing TBODY contents with innerHTML.
      // https://stackoverflow.com/a/8097055/515124
      // element.innerHTML = '<tr><td>cell</td></tr>';
      const fragment = _document.createDocumentFragment();
      fragment.innerHTML = '<tr><td>cell</td></tr>';
      element.appendChild(fragment);
    },
  };

  var focusVideoWithoutControls = {
    element: 'video',
    mutate: function(element) {
      try {
        // invalid media file can trigger warning in console, data-uri to prevent HTTP request
        element.setAttribute('src', gif);
      } catch (e) {
        // IE9 may throw "Error: Not implemented"
      }
    },
  };

  // https://jsbin.com/vafaba/3/edit?html,js,console,output
  const result$3 = platform$1.is.GECKO || platform$1.is.TRIDENT || platform$1.is.EDGE;

  function tabsequenceAreaAtImgPosition() {
    return result$3;
  }

  const testCallbacks = {
    cssShadowPiercingDeepCombinator,
    focusInZeroDimensionObject,
    focusObjectSwf,
    focusSvgInIframe,
    tabsequenceAreaAtImgPosition,
  };

  const testDescriptions = {
    focusAreaImgTabindex,
    focusAreaTabindex,
    focusAreaWithoutHref,
    focusAudioWithoutControls,
    focusBrokenImageMap,
    focusChildrenOfFocusableFlexbox,
    focusFieldsetDisabled,
    focusFieldset,
    focusFlexboxContainer,
    focusFormDisabled,
    focusImgIsmap,
    focusImgUsemapTabindex,
    focusInHiddenIframe,
    focusInvalidTabindex,
    focusLabelTabindex,
    focusObjectSvg,
    focusObjectSvgHidden,
    focusRedirectImgUsemap,
    focusRedirectLegend,
    focusScrollBody,
    focusScrollContainerWithoutOverflow,
    focusScrollContainer,
    focusSummary,
    focusSvgFocusableAttribute,
    focusSvgTabindexAttribute,
    focusSvgNegativeTabindexAttribute,
    focusSvgUseTabindex,
    focusSvgForeignobjectTabindex,
    focusSvg,
    focusTabindexTrailingCharacters,
    focusTable,
    focusVideoWithoutControls,
  };

  function executeTests() {
    const results = detectFocus(testDescriptions);
    Object.keys(testCallbacks).forEach(function(key) {
      results[key] = testCallbacks[key]();
    });

    return results;
  }

  let supportsCache = null;

  function _supports() {
    if (supportsCache) {
      return supportsCache;
    }

    supportsCache = cache$1.get();
    if (!supportsCache.time) {
      cache$1.set(executeTests());
      supportsCache = cache$1.get();
    }

    return supportsCache;
  }

  let supports;

  // https://www.w3.org/TR/html5/infrastructure.html#rules-for-parsing-integers
  // NOTE: all browsers agree to allow trailing spaces as well
  const validIntegerPatternNoTrailing = /^\s*(-|\+)?[0-9]+\s*$/;
  const validIntegerPatternWithTrailing = /^\s*(-|\+)?[0-9]+.*$/;

  function isValidTabindex(context) {
    if (!supports) {
      supports = _supports();
    }

    const validIntegerPattern = supports.focusTabindexTrailingCharacters
      ? validIntegerPatternWithTrailing
      : validIntegerPatternNoTrailing;

    const element = contextToElement({
      label: 'is/valid-tabindex',
      resolveDocument: true,
      context,
    });

    // Edge 14 has a capitalization problem on SVG elements,
    // see https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/9282058/
    const hasTabindex = element.hasAttribute('tabindex');
    const hasTabIndex = element.hasAttribute('tabIndex');

    if (!hasTabindex && !hasTabIndex) {
      return false;
    }

    // older Firefox and Internet Explorer don't support tabindex on SVG elements
    const isSvgElement = element.ownerSVGElement || element.nodeName.toLowerCase() === 'svg';
    if (isSvgElement && !supports.focusSvgTabindexAttribute) {
      return false;
    }

    // @browser-issue Gecko https://bugzilla.mozilla.org/show_bug.cgi?id=1128054
    if (supports.focusInvalidTabindex) {
      return true;
    }

    // an element matches the tabindex selector even if its value is invalid
    const tabindex = element.getAttribute(hasTabindex ? 'tabindex' : 'tabIndex');
    // IE11 parses tabindex="" as the value "-32768"
    // @browser-issue Trident https://connect.microsoft.com/IE/feedback/details/1072965
    if (tabindex === '-32768') {
      return false;
    }

    return Boolean(tabindex && validIntegerPattern.test(tabindex));
  }

  function tabindexValue(element) {
    if (!isValidTabindex(element)) {
      return null;
    }

    // Edge 14 has a capitalization problem on SVG elements,
    // see https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/9282058/
    const hasTabindex = element.hasAttribute('tabindex');
    const attributeName = hasTabindex ? 'tabindex' : 'tabIndex';

    // @browser-issue Gecko https://bugzilla.mozilla.org/show_bug.cgi?id=1128054
    const tabindex = parseInt(element.getAttribute(attributeName), 10);
    return isNaN(tabindex) ? -1 : tabindex;
  }

  // this is a shared utility file for focus-relevant.js and tabbable.js
  // separate testing of this file's functions is not necessary,
  // as they're implicitly tested by way of the consumers

  function isUserModifyWritable(style) {
    // https://www.w3.org/TR/1999/WD-css3-userint-19990916#user-modify
    // https://github.com/medialize/ally.js/issues/17
    const userModify = style.webkitUserModify || '';
    return Boolean(userModify && userModify.indexOf('write') !== -1);
  }

  function hasCssOverflowScroll(style) {
    return [
      style.getPropertyValue('overflow'),
      style.getPropertyValue('overflow-x'),
      style.getPropertyValue('overflow-y'),
    ].some(overflow => overflow === 'auto' || overflow === 'scroll');
  }

  function hasCssDisplayFlex(style) {
    return style.display.indexOf('flex') > -1;
  }

  function isScrollableContainer(element, nodeName, parentNodeName, parentStyle) {
    if (nodeName !== 'div' && nodeName !== 'span') {
      // Internet Explorer advances scrollable containers and bodies to focusable
      // only if the scrollable container is <div> or <span> - this does *not*
      // happen for <section>, <article>, …
      return false;
    }

    if (parentNodeName && parentNodeName !== 'div' && parentNodeName !== 'span' && !hasCssOverflowScroll(parentStyle)) {
      return false;
    }

    return element.offsetHeight < element.scrollHeight || element.offsetWidth < element.scrollWidth;
  }

  let supports$1;

  function isFocusRelevantRules({
    context,
    except = {
      flexbox: false,
      scrollable: false,
      shadow: false,
    },
  } = {}) {
    if (!supports$1) {
      supports$1 = _supports();
    }

    const element = contextToElement({
      label: 'is/focus-relevant',
      resolveDocument: true,
      context,
    });

    if (!except.shadow && element.shadowRoot) {
      // a ShadowDOM host receives focus when the focus moves to its content
      return true;
    }

    const nodeName = element.nodeName.toLowerCase();

    if (nodeName === 'input' && element.type === 'hidden') {
      // input[type="hidden"] supports.cannot be focused
      return false;
    }

    if (nodeName === 'input' || nodeName === 'select' || nodeName === 'button' || nodeName === 'textarea') {
      return true;
    }

    if (nodeName === 'legend' && supports$1.focusRedirectLegend) {
      // specifics filtered in is/focusable
      return true;
    }

    if (nodeName === 'label') {
      // specifics filtered in is/focusable
      return true;
    }

    if (nodeName === 'area') {
      // specifics filtered in is/focusable
      return true;
    }

    if (nodeName === 'a' && element.hasAttribute('href')) {
      return true;
    }

    if (nodeName === 'object' && element.hasAttribute('usemap')) {
      // object[usemap] is not focusable in any browser
      return false;
    }

    if (nodeName === 'object') {
      const svgType = element.getAttribute('type');
      if (!supports$1.focusObjectSvg && svgType === 'image/svg+xml') {
        // object[type="image/svg+xml"] is not focusable in Internet Explorer
        return false;
      } else if (!supports$1.focusObjectSwf && svgType === 'application/x-shockwave-flash') {
        // object[type="application/x-shockwave-flash"] is not focusable in Internet Explorer 9
        return false;
      }
    }

    if (nodeName === 'iframe' || nodeName === 'object') {
      // browsing context containers
      return true;
    }

    if (nodeName === 'embed' || nodeName === 'keygen') {
      // embed is considered focus-relevant but not focusable
      // see https://github.com/medialize/ally.js/issues/82
      return true;
    }

    if (element.hasAttribute('contenteditable')) {
      // also see CSS property user-modify below
      return true;
    }

    if (nodeName === 'audio' && (supports$1.focusAudioWithoutControls || element.hasAttribute('controls'))) {
      return true;
    }

    if (nodeName === 'video' && (supports$1.focusVideoWithoutControls || element.hasAttribute('controls'))) {
      return true;
    }

    if (supports$1.focusSummary && nodeName === 'summary') {
      return true;
    }

    const validTabindex = isValidTabindex(element);

    if (nodeName === 'img' && element.hasAttribute('usemap')) {
      // Gecko, Trident and Edge do not allow an image with an image map and tabindex to be focused,
      // it appears the tabindex is overruled so focus is still forwarded to the <map>
      return validTabindex && supports$1.focusImgUsemapTabindex || supports$1.focusRedirectImgUsemap;
    }

    if (supports$1.focusTable && (nodeName === 'table' || nodeName === 'td')) {
      // IE10-11 supports.can focus <table> and <td>
      return true;
    }

    if (supports$1.focusFieldset && nodeName === 'fieldset') {
      // IE10-11 supports.can focus <fieldset>
      return true;
    }

    const isSvgElement = nodeName === 'svg';
    const isSvgContent = element.ownerSVGElement;
    const focusableAttribute = element.getAttribute('focusable');
    const tabindex = tabindexValue(element);

    if (nodeName === 'use' && tabindex !== null && !supports$1.focusSvgUseTabindex) {
      // <use> cannot be made focusable by adding a tabindex attribute anywhere but Blink and WebKit
      return false;
    }

    if (nodeName === 'foreignobject') {
      // <use> can only be made focusable in Blink and WebKit
      return tabindex !== null && supports$1.focusSvgForeignobjectTabindex;
    }

    if (elementMatches(element, 'svg a') && element.hasAttribute('xlink:href')) {
      return true;
    }

    if ((isSvgElement || isSvgContent) && element.focus && !supports$1.focusSvgNegativeTabindexAttribute && tabindex < 0) {
      // Firefox 51 and 52 treat any natively tabbable SVG element with
      // tabindex="-1" as tabbable and everything else as inert
      // see https://bugzilla.mozilla.org/show_bug.cgi?id=1302340
      return false;
    }

    if (isSvgElement) {
      return validTabindex || supports$1.focusSvg || supports$1.focusSvgInIframe
        // Internet Explorer understands the focusable attribute introduced in SVG Tiny 1.2
        || Boolean(supports$1.focusSvgFocusableAttribute && focusableAttribute && focusableAttribute === 'true');
    }

    if (isSvgContent) {
      if (supports$1.focusSvgTabindexAttribute && validTabindex) {
        return true;
      }

      if (supports$1.focusSvgFocusableAttribute) {
        // Internet Explorer understands the focusable attribute introduced in SVG Tiny 1.2
        return focusableAttribute === 'true';
      }
    }

    // https://www.w3.org/TR/html5/editing.html#sequential-focus-navigation-and-the-tabindex-attribute
    if (validTabindex) {
      return true;
    }

    const style = window.getComputedStyle(element, null);
    if (isUserModifyWritable(style)) {
      return true;
    }

    if (supports$1.focusImgIsmap && nodeName === 'img' && element.hasAttribute('ismap')) {
      // IE10-11 considers the <img> in <a href><img ismap> focusable
      // https://github.com/medialize/ally.js/issues/20
      const hasLinkParent = getParents({context: element}).some(
        parent => parent.nodeName.toLowerCase() === 'a' && parent.hasAttribute('href')
      );

      if (hasLinkParent) {
        return true;
      }
    }

    // https://github.com/medialize/ally.js/issues/21
    if (!except.scrollable && supports$1.focusScrollContainer) {
      if (supports$1.focusScrollContainerWithoutOverflow) {
        // Internet Explorer does will consider the scrollable area focusable
        // if the element is a <div> or a <span> and it is in fact scrollable,
        // regardless of the CSS overflow property
        if (isScrollableContainer(element, nodeName)) {
          return true;
        }
      } else if (hasCssOverflowScroll(style)) {
        // Firefox requires proper overflow setting, IE does not necessarily
        // https://developer.mozilla.org/en-US/docs/Web/CSS/overflow
        return true;
      }
    }

    if (!except.flexbox && supports$1.focusFlexboxContainer && hasCssDisplayFlex(style)) {
      // elements with display:flex are focusable in IE10-11
      return true;
    }

    const parent = element.parentElement;
    if (!except.scrollable && parent) {
      const parentNodeName = parent.nodeName.toLowerCase();
      const parentStyle = window.getComputedStyle(parent, null);
      if (supports$1.focusScrollBody && isScrollableContainer(parent, nodeName, parentNodeName, parentStyle)) {
        // scrollable bodies are focusable Internet Explorer
        // https://github.com/medialize/ally.js/issues/21
        return true;
      }

      // Children of focusable elements with display:flex are focusable in IE10-11
      if (supports$1.focusChildrenOfFocusableFlexbox) {
        if (hasCssDisplayFlex(parentStyle)) {
          return true;
        }
      }
    }

    // NOTE: elements marked as inert are not focusable,
    // but that property is not exposed to the DOM
    // https://www.w3.org/TR/html5/editing.html#inert

    return false;
  }

  // bind exceptions to an iterator callback
  isFocusRelevantRules.except = function(except = {}) {
    const isFocusRelevant = function(context) {
      return isFocusRelevantRules({
        context,
        except,
      });
    };

    isFocusRelevant.rules = isFocusRelevantRules;
    return isFocusRelevant;
  };

  // provide isFocusRelevant(context) as default iterator callback
  const isFocusRelevant = isFocusRelevantRules.except({});

  function getContentDocument(node) {
    try {
      // works on <object> and <iframe>
      return node.contentDocument
        // works on <object> and <iframe>
        || node.contentWindow && node.contentWindow.document
        // works on <object> and <iframe> that contain SVG
        || node.getSVGDocument && node.getSVGDocument()
        || null;
    } catch (e) {
      // SecurityError: Failed to read the 'contentDocument' property from 'HTMLObjectElement'
      // also IE may throw member not found exception e.g. on <object type="image/png">
      return null;
    }
  }

  function getDocument(node) {
    if (!node) {
      return document;
    }

    if (node.nodeType === Node.DOCUMENT_NODE) {
      return node;
    }

    return node.ownerDocument || document;
  }

  function getWindow(node) {
    const _document = getDocument(node);
    return _document.defaultView || window;
  }

  let shadowPrefix;

  function selectInShadows(selector) {
    if (typeof shadowPrefix !== 'string') {
      const operator = cssShadowPiercingDeepCombinator();
      if (operator) {
        shadowPrefix = ', html ' + operator + ' ';
      }
    }

    if (!shadowPrefix) {
      return selector;
    }

    return selector + shadowPrefix + selector.replace(/\s*,\s*/g, ',').split(',').join(shadowPrefix);
  }

  let selector;

  function findDocumentHostElement(_window) {
    if (!selector) {
      selector = selectInShadows('object, iframe');
    }

    if (_window._frameElement !== undefined) {
      return _window._frameElement;
    }

    _window._frameElement = null;

    const potentialHosts = _window.parent.document.querySelectorAll(selector);
    [].some.call(potentialHosts, function(element) {
      const _document = getContentDocument(element);
      if (_document !== _window.document) {
        return false;
      }

      _window._frameElement = element;
      return true;
    });

    return _window._frameElement;
  }

  function getFrameElement(element) {
    const _window = getWindow(element);
    if (!_window.parent || _window.parent === _window) {
      // if there is no parent browsing context,
      // we're not going to get a frameElement either way
      return null;
    }

    try {
      // see https://developer.mozilla.org/en-US/docs/Web/API/Window/frameElement
      // does not work within <embed> anywhere, and not within in <object> in IE
      return _window.frameElement || findDocumentHostElement(_window);
    } catch (e) {
      return null;
    }
  }

  // https://www.w3.org/TR/html5/rendering.html#being-rendered
  // <area> is not rendered, but we *consider* it visible to simplfiy this function's usage
  const notRenderedElementsPattern = /^(area)$/;

  function computedStyle(element, property) {
    return window.getComputedStyle(element, null)
      .getPropertyValue(property);
  }

  function notDisplayed(_path) {
    return _path.some(function(element) {
      // display:none is not visible (optimized away at layout)
      return computedStyle(element, 'display') === 'none';
    });
  }

  function notVisible(_path) {
    // https://github.com/jquery/jquery-ui/blob/master/ui/core.js#L109-L114
    // NOTE: a nested element can reverse visibility:hidden|collapse by explicitly setting visibility:visible
    // NOTE: visibility can be ["", "visible", "hidden", "collapse"]
    const hidden = findIndex(_path, function(element) {
      const visibility = computedStyle(element, 'visibility');
      return visibility === 'hidden' || visibility === 'collapse';
    });

    if (hidden === -1) {
      // there is no hidden element
      return false;
    }

    const visible = findIndex(_path, function(element) {
      return computedStyle(element, 'visibility') === 'visible';
    });

    if (visible === -1) {
      // there is no visible element (but a hidden element)
      return true;
    }

    if (hidden < visible) {
      // there is a hidden element and it's closer than the first visible element
      return true;
    }

    // there may be a hidden element, but the closest element is visible
    return false;
  }

  function collapsedParent(_path) {
    let offset = 1;
    if (_path[0].nodeName.toLowerCase() === 'summary') {
      offset = 2;
    }

    return _path.slice(offset).some(function(element) {
      // "content children" of a closed details element are not visible
      return element.nodeName.toLowerCase() === 'details' && element.open === false;
    });
  }

  function isVisibleRules({
    context,
    except = {
      notRendered: false,
      cssDisplay: false,
      cssVisibility: false,
      detailsElement: false,
      browsingContext: false,
    },
  } = {}) {
    const element = contextToElement({
      label: 'is/visible',
      resolveDocument: true,
      context,
    });

    const nodeName = element.nodeName.toLowerCase();
    if (!except.notRendered && notRenderedElementsPattern.test(nodeName)) {
      return true;
    }

    const _path = getParents({context: element});

    // in Internet Explorer <audio> has a default display: none, where others have display: inline
    // but IE allows focusing <audio style="display:none">, but not <div display:none><audio>
    // this is irrelevant to other browsers, as the controls attribute is required to make <audio> focusable
    const isAudioWithoutControls = nodeName === 'audio' && !element.hasAttribute('controls');
    if (!except.cssDisplay && notDisplayed(isAudioWithoutControls ? _path.slice(1) : _path)) {
      return false;
    }

    if (!except.cssVisibility && notVisible(_path)) {
      return false;
    }

    if (!except.detailsElement && collapsedParent(_path)) {
      return false;
    }

    if (!except.browsingContext) {
      // elements within a browsing context are affected by the
      // browsing context host element's visibility and tabindex
      const frameElement = getFrameElement(element);
      const _isVisible = isVisibleRules.except(except);
      if (frameElement && !_isVisible(frameElement)) {
        return false;
      }
    }

    return true;
  }

  // bind exceptions to an iterator callback
  isVisibleRules.except = function(except = {}) {
    const isVisible = function(context) {
      return isVisibleRules({
        context,
        except,
      });
    };

    isVisible.rules = isVisibleRules;
    return isVisible;
  };

  // provide isVisible(context) as default iterator callback
  const isVisible = isVisibleRules.except({});

  var css_escape = createCommonjsModule(function (module, exports) {
  (function(root, factory) {
  	// https://github.com/umdjs/umd/blob/master/returnExports.js
  	{
  		// For Node.js.
  		module.exports = factory(root);
  	}
  }(typeof commonjsGlobal != 'undefined' ? commonjsGlobal : commonjsGlobal, function(root) {

  	if (root.CSS && root.CSS.escape) {
  		return root.CSS.escape;
  	}

  	// https://drafts.csswg.org/cssom/#serialize-an-identifier
  	var cssEscape = function(value) {
  		if (arguments.length == 0) {
  			throw new TypeError('`CSS.escape` requires an argument.');
  		}
  		var string = String(value);
  		var length = string.length;
  		var index = -1;
  		var codeUnit;
  		var result = '';
  		var firstCodeUnit = string.charCodeAt(0);
  		while (++index < length) {
  			codeUnit = string.charCodeAt(index);
  			// Note: there’s no need to special-case astral symbols, surrogate
  			// pairs, or lone surrogates.

  			// If the character is NULL (U+0000), then the REPLACEMENT CHARACTER
  			// (U+FFFD).
  			if (codeUnit == 0x0000) {
  				result += '\uFFFD';
  				continue;
  			}

  			if (
  				// If the character is in the range [\1-\1F] (U+0001 to U+001F) or is
  				// U+007F, […]
  				(codeUnit >= 0x0001 && codeUnit <= 0x001F) || codeUnit == 0x007F ||
  				// If the character is the first character and is in the range [0-9]
  				// (U+0030 to U+0039), […]
  				(index == 0 && codeUnit >= 0x0030 && codeUnit <= 0x0039) ||
  				// If the character is the second character and is in the range [0-9]
  				// (U+0030 to U+0039) and the first character is a `-` (U+002D), […]
  				(
  					index == 1 &&
  					codeUnit >= 0x0030 && codeUnit <= 0x0039 &&
  					firstCodeUnit == 0x002D
  				)
  			) {
  				// https://drafts.csswg.org/cssom/#escape-a-character-as-code-point
  				result += '\\' + codeUnit.toString(16) + ' ';
  				continue;
  			}

  			if (
  				// If the character is the first character and is a `-` (U+002D), and
  				// there is no second character, […]
  				index == 0 &&
  				length == 1 &&
  				codeUnit == 0x002D
  			) {
  				result += '\\' + string.charAt(index);
  				continue;
  			}

  			// If the character is not handled by one of the above rules and is
  			// greater than or equal to U+0080, is `-` (U+002D) or `_` (U+005F), or
  			// is in one of the ranges [0-9] (U+0030 to U+0039), [A-Z] (U+0041 to
  			// U+005A), or [a-z] (U+0061 to U+007A), […]
  			if (
  				codeUnit >= 0x0080 ||
  				codeUnit == 0x002D ||
  				codeUnit == 0x005F ||
  				codeUnit >= 0x0030 && codeUnit <= 0x0039 ||
  				codeUnit >= 0x0041 && codeUnit <= 0x005A ||
  				codeUnit >= 0x0061 && codeUnit <= 0x007A
  			) {
  				// the character itself
  				result += string.charAt(index);
  				continue;
  			}

  			// Otherwise, the escaped character.
  			// https://drafts.csswg.org/cssom/#escape-a-character
  			result += '\\' + string.charAt(index);

  		}
  		return result;
  	};

  	if (!root.CSS) {
  		root.CSS = {};
  	}

  	root.CSS.escape = cssEscape;
  	return cssEscape;

  }));
  });

  function getMapByName(name, _document) {
    // apparently getElementsByName() also considers id attribute in IE & opera
    // https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementsByName
    const map = _document.querySelector('map[name="' + css_escape(name) + '"]');
    return map || null;
  }

  function getImageOfArea(element) {
    const map = element.parentElement;

    if (!map.name || map.nodeName.toLowerCase() !== 'map') {
      return null;
    }

    // NOTE: image maps can also be applied to <object> with image content,
    // but no browser supports this at the moment

    // HTML5 specifies HTMLMapElement.images to be an HTMLCollection of all
    // <img> and <object> referencing the <map> element, but no browser implements this
    //   https://www.w3.org/TR/html5/embedded-content-0.html#the-map-element
    //   https://developer.mozilla.org/en-US/docs/Web/API/HTMLMapElement
    // the image must be valid and loaded for the map to take effect
    const _document = getDocument(element);
    return _document.querySelector('img[usemap="#' + css_escape(map.name) + '"]') || null;
  }

  let supports$2;

  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/map
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#attr-usemap
  // https://github.com/jquery/jquery-ui/blob/master/ui/core.js#L88-L107
  function isValidArea(context) {
    if (!supports$2) {
      supports$2 = _supports();
    }

    const element = contextToElement({
      label: 'is/valid-area',
      context,
    });

    const nodeName = element.nodeName.toLowerCase();
    if (nodeName !== 'area') {
      return false;
    }

    const hasTabindex = element.hasAttribute('tabindex');
    if (!supports$2.focusAreaTabindex && hasTabindex) {
      // Blink and WebKit do not consider <area tabindex="-1" href="#void"> focusable
      return false;
    }

    const img = getImageOfArea(element);
    if (!img || !isVisible(img)) {
      return false;
    }

    // Firefox only allows fully loaded images to reference image maps
    // https://stereochro.me/ideas/detecting-broken-images-js
    if (!supports$2.focusBrokenImageMap && (!img.complete || !img.naturalHeight || img.offsetWidth <= 0 || img.offsetHeight <= 0)) {
      return false;
    }

    // Firefox supports.can focus area elements even if they don't have an href attribute
    if (!supports$2.focusAreaWithoutHref && !element.href) {
      // Internet explorer supports.can focus area elements without href if either
      // the area element or the image element has a tabindex attribute
      return supports$2.focusAreaTabindex && hasTabindex || supports$2.focusAreaImgTabindex && img.hasAttribute('tabindex');
    }

    // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#attr-usemap
    const childOfInteractive = getParents({context: img}).slice(1).some(function(_element) {
      const name = _element.nodeName.toLowerCase();
      return name === 'button' || name === 'a';
    });

    if (childOfInteractive) {
      return false;
    }

    return true;
  }

  let supports$3;

  // https://www.w3.org/TR/html5/disabled-elements.html#concept-element-disabled
  let disabledElementsPattern;
  const disabledElements = {
    input: true,
    select: true,
    textarea: true,
    button: true,
    fieldset: true,
    form: true,
  };

  function isNativeDisabledSupported(context) {
    if (!supports$3) {
      supports$3 = _supports();

      if (supports$3.focusFieldsetDisabled) {
        delete disabledElements.fieldset;
      }

      if (supports$3.focusFormDisabled) {
        delete disabledElements.form;
      }

      disabledElementsPattern = new RegExp('^(' + Object.keys(disabledElements).join('|') + ')$');
    }

    const element = contextToElement({
      label: 'is/native-disabled-supported',
      context,
    });

    const nodeName = element.nodeName.toLowerCase();
    return Boolean(disabledElementsPattern.test(nodeName));
  }

  let supports$4;

  function isDisabledFieldset(element) {
    const nodeName = element.nodeName.toLowerCase();
    return nodeName === 'fieldset' && element.disabled;
  }

  function isDisabledForm(element) {
    const nodeName = element.nodeName.toLowerCase();
    return nodeName === 'form' && element.disabled;
  }

  function isDisabled(context) {
    if (!supports$4) {
      supports$4 = _supports();
    }

    const element = contextToElement({
      label: 'is/disabled',
      context,
    });

    if (element.hasAttribute('data-ally-disabled')) {
      // treat ally's element/disabled like the DOM native element.disabled
      return true;
    }

    if (!isNativeDisabledSupported(element)) {
      // non-form elements do not support the disabled attribute
      return false;
    }

    if (element.disabled) {
      // the element itself is disabled
      return true;
    }

    const parents = getParents({context: element});
    if (parents.some(isDisabledFieldset)) {
      // a parental <fieldset> is disabld and inherits the state onto this element
      return true;
    }

    if (!supports$4.focusFormDisabled && parents.some(isDisabledForm)) {
      // a parental <form> is disabld and inherits the state onto this element
      return true;
    }

    return false;
  }

  function isOnlyTabbableRules({
    context,
    except = {
      onlyFocusableBrowsingContext: false,
      visible: false,
    },
  } = {}) {
    const element = contextToElement({
      label: 'is/only-tabbable',
      resolveDocument: true,
      context,
    });

    if (!except.visible && !isVisible(element)) {
      return false;
    }

    if (!except.onlyFocusableBrowsingContext && (platform$1.is.GECKO || platform$1.is.TRIDENT || platform$1.is.EDGE)) {
      const frameElement = getFrameElement(element);
      if (frameElement) {
        if (tabindexValue(frameElement) < 0) {
          // iframe[tabindex="-1"] and object[tabindex="-1"] inherit the
          // tabbable demotion onto elements of their browsing contexts
          return false;
        }
      }
    }

    const nodeName = element.nodeName.toLowerCase();
    const tabindex = tabindexValue(element);

    if (nodeName === 'label' && platform$1.is.GECKO) {
      // Firefox cannot focus, but tab to: label[tabindex=0]
      return tabindex !== null && tabindex >= 0;
    }

    // SVG Elements were keyboard focusable but not script focusable before Firefox 51.
    // Firefox 51 added the focus management DOM API (.focus and .blur) to SVGElement,
    // see https://bugzilla.mozilla.org/show_bug.cgi?id=778654
    if (platform$1.is.GECKO && element.ownerSVGElement && !element.focus) {
      if (nodeName === 'a' && element.hasAttribute('xlink:href')) {
        // any focusable child of <svg> cannot be focused, but tabbed to
        if (platform$1.is.GECKO) {
          return true;
        }
      }
    }

    return false;
  }

  // bind exceptions to an iterator callback
  isOnlyTabbableRules.except = function(except = {}) {
    const isOnlyTabbable = function(context) {
      return isOnlyTabbableRules({
        context,
        except,
      });
    };

    isOnlyTabbable.rules = isOnlyTabbableRules;
    return isOnlyTabbable;
  };

  // provide isOnlyTabbable(context) as default iterator callback
  const isOnlyTabbable = isOnlyTabbableRules.except({});

  let supports$5;

  function isOnlyFocusRelevant(element) {
    const nodeName = element.nodeName.toLowerCase();
    if (nodeName === 'embed' || nodeName === 'keygen') {
      // embed is considered focus-relevant but not focusable
      // see https://github.com/medialize/ally.js/issues/82
      return true;
    }

    const _tabindex = tabindexValue(element);
    if (element.shadowRoot && _tabindex === null) {
      // ShadowDOM host elements *may* receive focus
      // even though they are not considered focuable
      return true;
    }

    if (nodeName === 'label') {
      // <label tabindex="0"> is only tabbable in Firefox, not script-focusable
      // there's no way to make an element focusable other than by adding a tabindex,
      // and focus behavior of the label element seems hard-wired to ignore tabindex
      // in some browsers (like Gecko, Blink and WebKit)
      return !supports$5.focusLabelTabindex || _tabindex === null;
    }

    if (nodeName === 'legend') {
      return _tabindex === null;
    }

    if (supports$5.focusSvgFocusableAttribute && (element.ownerSVGElement || nodeName === 'svg')) {
      // Internet Explorer understands the focusable attribute introduced in SVG Tiny 1.2
      const focusableAttribute = element.getAttribute('focusable');
      return focusableAttribute && focusableAttribute === 'false';
    }

    if (nodeName === 'img' && element.hasAttribute('usemap')) {
      // Gecko, Trident and Edge do not allow an image with an image map and tabindex to be focused,
      // it appears the tabindex is overruled so focus is still forwarded to the <map>
      return _tabindex === null || !supports$5.focusImgUsemapTabindex;
    }

    if (nodeName === 'area') {
      // all <area>s are considered relevant,
      // but only the valid <area>s are focusable
      return !isValidArea(element);
    }

    return false;
  }

  function isFocusableRules({
    context,
    except = {
      disabled: false,
      visible: false,
      onlyTabbable: false,
    },
  } = {}) {
    if (!supports$5) {
      supports$5 = _supports();
    }

    const _isOnlyTabbable = isOnlyTabbable.rules.except({
      onlyFocusableBrowsingContext: true,
      visible: except.visible,
    });

    const element = contextToElement({
      label: 'is/focusable',
      resolveDocument: true,
      context,
    });

    const focusRelevant = isFocusRelevant.rules({
      context: element,
      except,
    });

    if (!focusRelevant || isOnlyFocusRelevant(element)) {
      return false;
    }

    if (!except.disabled && isDisabled(element)) {
      return false;
    }

    if (!except.onlyTabbable && _isOnlyTabbable(element)) {
      // some elements may be keyboard focusable, but not script focusable
      return false;
    }

    // elements that are not rendered, cannot be focused
    if (!except.visible) {
      const visibilityOptions = {
        context: element,
        except: {},
      };

      if (supports$5.focusInHiddenIframe) {
        // WebKit and Blink can focus content in hidden <iframe> and <object>
        visibilityOptions.except.browsingContext = true;
      }

      if (supports$5.focusObjectSvgHidden) {
        // Blink allows focusing the object element, even if it has visibility: hidden;
        // @browser-issue Blink https://code.google.com/p/chromium/issues/detail?id=586191
        const nodeName = element.nodeName.toLowerCase();
        if (nodeName === 'object') {
          visibilityOptions.except.cssVisibility = true;
        }
      }

      if (!isVisible.rules(visibilityOptions)) {
        return false;
      }
    }

    const frameElement = getFrameElement(element);
    if (frameElement) {
      const _nodeName = frameElement.nodeName.toLowerCase();
      if (_nodeName === 'object' && !supports$5.focusInZeroDimensionObject) {
        if (!frameElement.offsetWidth || !frameElement.offsetHeight) {
          // WebKit can not focus content in <object> if it doesn't have dimensions
          return false;
        }
      }
    }

    const nodeName = element.nodeName.toLowerCase();
    if (nodeName === 'svg' && supports$5.focusSvgInIframe && !frameElement && element.getAttribute('tabindex') === null) {
      return false;
    }

    return true;
  }

  // bind exceptions to an iterator callback
  isFocusableRules.except = function(except = {}) {
    const isFocusable = function(context) {
      return isFocusableRules({
        context,
        except,
      });
    };

    isFocusable.rules = isFocusableRules;
    return isFocusable;
  };

  // provide isFocusRelevant(context) as default iterator callback
  const isFocusable = isFocusableRules.except({});

  function createFilter(condition) {
    // see https://developer.mozilla.org/en-US/docs/Web/API/NodeFilter
    const filter = function(node) {
      if (node.shadowRoot) {
        // return ShadowRoot elements regardless of them being focusable,
        // so they can be walked recursively later
        return NodeFilter.FILTER_ACCEPT;
      }

      if (condition(node)) {
        // finds elements that could have been found by document.querySelectorAll()
        return NodeFilter.FILTER_ACCEPT;
      }

      return NodeFilter.FILTER_SKIP;
    };
    // IE requires a function, Browsers require {acceptNode: function}
    // see http://www.bennadel.com/blog/2607-finding-html-comment-nodes-in-the-dom-using-treewalker.htm
    filter.acceptNode = filter;
    return filter;
  }

  const PossiblyFocusableFilter = createFilter(isFocusRelevant);

  function queryFocusableStrict({
    context,
    includeContext,
    includeOnlyTabbable,
    strategy,
  } = {}) {
    if (!context) {
      context = document.documentElement;
    }

    const _isFocusable = isFocusable.rules.except({
      onlyTabbable: includeOnlyTabbable,
    });

    const _document = getDocument(context);
    // see https://developer.mozilla.org/en-US/docs/Web/API/Document/createTreeWalker
    const walker = _document.createTreeWalker(
      // root element to start search in
      context,
      // element type filter
      NodeFilter.SHOW_ELEMENT,
      // custom NodeFilter filter
      strategy === 'all' ? PossiblyFocusableFilter : createFilter(_isFocusable),
      // deprecated, but IE requires it
      false
    );

    let list = [];

    while (walker.nextNode()) {
      if (walker.currentNode.shadowRoot) {
        if (_isFocusable(walker.currentNode)) {
          list.push(walker.currentNode);
        }

        list = list.concat(queryFocusableStrict({
          context: walker.currentNode.shadowRoot,
          includeOnlyTabbable,
          strategy,
        }));
      } else {
        list.push(walker.currentNode);
      }
    }

    // add context if requested and focusable
    if (includeContext) {
      if (strategy === 'all') {
        if (isFocusRelevant(context)) {
          list.unshift(context);
        }
      } else if (_isFocusable(context)) {
        list.unshift(context);
      }
    }

    return list;
  }

  // NOTE: this selector MUST *never* be used directly,
  let supports$6;

  let selector$1;

  function selector$2() {
    if (!supports$6) {
      supports$6 = _supports();
    }

    if (typeof selector$1 === 'string') {
      return selector$1;
    }

    // https://www.w3.org/TR/html5/editing.html#sequential-focus-navigation-and-the-tabindex-attribute
    selector$1 = ''
      // IE11 supports.can focus <table> and <td>
      + (supports$6.focusTable ? 'table, td,' : '')
      // IE11 supports.can focus <fieldset>
      + (supports$6.focusFieldset ? 'fieldset,' : '')
      // Namespace problems of [xlink:href] explained in https://stackoverflow.com/a/23047888/515124
      // svg a[*|href] does not match in IE9, but since we're filtering
      // through is/focusable we can include all <a> from SVG
      + 'svg a,'
      // may behave as 'svg, svg *,' in chrome as *every* svg element with a focus event listener is focusable
      // navigational elements
      + 'a[href],'
      // validity determined by is/valid-area.js
      + 'area[href],'
      // validity determined by is/disabled.js
      + 'input, select, textarea, button,'
      // browsing context containers
      + 'iframe, object, embed,'
      // interactive content
      + 'keygen,'
      + (supports$6.focusAudioWithoutControls ? 'audio,' : 'audio[controls],')
      + (supports$6.focusVideoWithoutControls ? 'video,' : 'video[controls],')
      + (supports$6.focusSummary ? 'summary,' : '')
      // validity determined by is/valid-tabindex.js
      + '[tabindex],'
      // editing hosts
      + '[contenteditable]';

    // where ShadowDOM is supported, we also want the shadowed focusable elements (via ">>>" or "/deep/")
    selector$1 = selectInShadows(selector$1);

    return selector$1;
  }

  function queryFocusableQuick({
    context,
    includeContext,
    includeOnlyTabbable,
  } = {}) {
    const _selector = selector$2();
    const elements = context.querySelectorAll(_selector);
    // the selector potentially matches more than really is focusable

    const _isFocusable = isFocusable.rules.except({
      onlyTabbable: includeOnlyTabbable,
    });

    const result = [].filter.call(elements, _isFocusable);

    // add context if requested and focusable
    if (includeContext && _isFocusable(context)) {
      result.unshift(context);
    }

    return result;
  }

  function queryFocusable({
    context,
    includeContext,
    includeOnlyTabbable,
    strategy = 'quick',
  } = {}) {
    const element = contextToElement({
      label: 'query/focusable',
      resolveDocument: true,
      defaultToDocument: true,
      context,
    });

    const options = {
      context: element,
      includeContext,
      includeOnlyTabbable,
      strategy,
    };

    if (strategy === 'quick') {
      return queryFocusableQuick(options);
    } else if (strategy === 'strict' || strategy === 'all') {
      return queryFocusableStrict(options);
    }

    throw new TypeError('query/focusable requires option.strategy to be one of ["quick", "strict", "all"]');
  }

  let supports$7;

  // Internet Explorer 11 considers fieldset, table, td focusable, but not tabbable
  // Internet Explorer 11 considers body to have [tabindex=0], but does not allow tabbing to it
  const focusableElementsPattern = /^(fieldset|table|td|body)$/;

  function isTabbableRules({
    context,
    except = {
      flexbox: false,
      scrollable: false,
      shadow: false,
      visible: false,
      onlyTabbable: false,
    },
  } = {}) {
    if (!supports$7) {
      supports$7 = _supports();
    }

    const element = contextToElement({
      label: 'is/tabbable',
      resolveDocument: true,
      context,
    });

    if (platform$1.is.BLINK && platform$1.is.ANDROID && platform$1.majorVersion > 42) {
      // External keyboard support worked fine in CHrome 42, but stopped working in Chrome 45.
      // The on-screen keyboard does not provide a way to focus the next input element (like iOS does).
      // That leaves us with no option to advance focus by keyboard, ergo nothing is tabbable (keyboard focusable).
      return false;
    }

    const frameElement = getFrameElement(element);
    if (frameElement) {
      if (platform$1.is.WEBKIT && platform$1.is.IOS) {
        // iOS only does not consider anything from another browsing context keyboard focusable
        return false;
      }

      // iframe[tabindex="-1"] and object[tabindex="-1"] inherit the
      // tabbable demotion onto elements of their browsing contexts
      if (tabindexValue(frameElement) < 0) {
        return false;
      }

      if (!except.visible && (platform$1.is.BLINK || platform$1.is.WEBKIT) && !isVisible(frameElement)) {
        // Blink and WebKit consider elements in hidden browsing contexts focusable, but not tabbable
        return false;
      }

      // Webkit and Blink don't consider anything in <object> tabbable
      // Blink fixed that fixed in Chrome 54, Opera 41
      const frameNodeName = frameElement.nodeName.toLowerCase();
      if (frameNodeName === 'object') {
        const isFixedBlink = (platform$1.name === 'Chrome' && platform$1.majorVersion >= 54)
          || (platform$1.name === 'Opera' && platform$1.majorVersion >= 41);

        if (platform$1.is.WEBKIT || (platform$1.is.BLINK && !isFixedBlink)) {
          return false;
        }
      }
    }

    const nodeName = element.nodeName.toLowerCase();
    const _tabindex = tabindexValue(element);
    const tabindex = _tabindex === null ? null : _tabindex >= 0;

    if (platform$1.is.EDGE && platform$1.majorVersion >= 14 && frameElement && element.ownerSVGElement && _tabindex < 0) {
      // Edge 14+ considers <a xlink:href="…" tabindex="-1"> keyboard focusable
      // if the element is in a nested browsing context
      return true;
    }

    const hasTabbableTabindexOrNone = tabindex !== false;
    const hasTabbableTabindex = _tabindex !== null && _tabindex >= 0;

    // NOTE: Firefox 31 considers [contenteditable] to have [tabindex=-1], but allows tabbing to it
    // fixed in Firefox 40 the latest - https://bugzilla.mozilla.org/show_bug.cgi?id=1185657
    if (element.hasAttribute('contenteditable')) {
      // tabbing can still be disabled by explicitly providing [tabindex="-1"]
      return hasTabbableTabindexOrNone;
    }

    if (focusableElementsPattern.test(nodeName) && tabindex !== true) {
      return false;
    }

    if (platform$1.is.WEBKIT && platform$1.is.IOS) {
      // iOS only considers a hand full of elements tabbable (keyboard focusable)
      // this holds true even with external keyboards
      let potentiallyTabbable = (nodeName === 'input' && element.type === 'text' || element.type === 'password')
        || nodeName === 'select'
        || nodeName === 'textarea'
        || element.hasAttribute('contenteditable');

      if (!potentiallyTabbable) {
        const style = window.getComputedStyle(element, null);
        potentiallyTabbable = isUserModifyWritable(style);
      }

      if (!potentiallyTabbable) {
        return false;
      }
    }

    if (nodeName === 'use' && _tabindex !== null) {
      if (platform$1.is.BLINK || platform$1.is.WEBKIT && platform$1.majorVersion === 9) {
        // In Chrome and Safari 9 the <use> element is keyboard focusable even for tabindex="-1"
        return true;
      }
    }

    if (elementMatches(element, 'svg a') && element.hasAttribute('xlink:href')) {
      if (hasTabbableTabindexOrNone) {
        // in Trident and Gecko SVGElement does not handle the tabIndex property properly
        return true;
      }

      if (element.focus && !supports$7.focusSvgNegativeTabindexAttribute) {
        // Firefox 51 and 52 treat any natively tabbable SVG element with
        // tabindex="-1" as tabbable and everything else as inert
        // see https://bugzilla.mozilla.org/show_bug.cgi?id=1302340
        return true;
      }
    }

    if (nodeName === 'svg' && supports$7.focusSvgInIframe && hasTabbableTabindexOrNone) {
      return true;
    }

    if (platform$1.is.TRIDENT || platform$1.is.EDGE) {
      if (nodeName === 'svg') {
        if (supports$7.focusSvg) {
          // older Internet Explorers consider <svg> keyboard focusable
          // unless they have focsable="false", but then they wouldn't
          // be focusable and thus not even reach this filter
          return true;
        }

        // elements that have [focusable] are automatically keyboard focusable regardless of the attribute's value
        return element.hasAttribute('focusable') || hasTabbableTabindex;
      }

      if (element.ownerSVGElement) {
        if (supports$7.focusSvgTabindexAttribute && hasTabbableTabindex) {
          return true;
        }

        // elements that have [focusable] are automatically keyboard focusable regardless of the attribute's value
        return element.hasAttribute('focusable');
      }
    }
    if (element.tabIndex === undefined) {
      return Boolean(except.onlyTabbable);
    }

    if (nodeName === 'audio') {
      if (!element.hasAttribute('controls')) {
        // In Internet Explorer the <audio> element is focusable, but not tabbable, and tabIndex property is wrong
        return false;
      } else if (platform$1.is.BLINK) {
        // In Chrome <audio controls tabindex="-1"> remains keyboard focusable
        return true;
      }
    }

    if (nodeName === 'video') {
      if (!element.hasAttribute('controls')) {
        if (platform$1.is.TRIDENT || platform$1.is.EDGE) {
          // In Internet Explorer and Edge the <video> element is focusable, but not tabbable, and tabIndex property is wrong
          return false;
        }
      } else if (platform$1.is.BLINK || platform$1.is.GECKO) {
        // In Chrome and Firefox <video controls tabindex="-1"> remains keyboard focusable
        return true;
      }
    }

    if (nodeName === 'object') {
      if (platform$1.is.BLINK || platform$1.is.WEBKIT) {
        // In all Blink and WebKit based browsers <embed> and <object> are never keyboard focusable, even with tabindex="0" set
        return false;
      }
    }

    if (nodeName === 'iframe') {
      // In Internet Explorer all iframes are only focusable
      // In WebKit, Blink and Gecko iframes may be tabbable depending on content.
      // Since we can't reliably investigate iframe documents because of the
      // SameOriginPolicy, we're declaring everything only focusable.
      return false;
    }

    if (!except.scrollable && platform$1.is.GECKO) {
      // Firefox considers scrollable containers keyboard focusable,
      // even though their tabIndex property is -1
      const style = window.getComputedStyle(element, null);
      if (hasCssOverflowScroll(style)) {
        return hasTabbableTabindexOrNone;
      }
    }

    if (platform$1.is.TRIDENT || platform$1.is.EDGE) {
      // IE and Edge degrade <area> to script focusable, if the image
      // using the <map> has been given tabindex="-1"
      if (nodeName === 'area') {
        const img = getImageOfArea(element);
        if (img && tabindexValue(img) < 0) {
          return false;
        }
      }

      const style = window.getComputedStyle(element, null);
      if (isUserModifyWritable(style)) {
        // prevent being swallowed by the overzealous isScrollableContainer() below
        return element.tabIndex >= 0;
      }

      if (!except.flexbox && hasCssDisplayFlex(style)) {
        if (_tabindex !== null) {
          return hasTabbableTabindex;
        }

        return isFocusRelevantWithoutFlexbox(element) && isTabbableWithoutFlexbox(element);
      }

      // IE considers scrollable containers script focusable only,
      // even though their tabIndex property is 0
      if (isScrollableContainer(element, nodeName)) {
        return false;
      }

      const parent = element.parentElement;
      if (parent) {
        const parentNodeName = parent.nodeName.toLowerCase();
        const parentStyle = window.getComputedStyle(parent, null);
        // IE considers scrollable bodies script focusable only,
        if (isScrollableContainer(parent, nodeName, parentNodeName, parentStyle)) {
          return false;
        }

        // Children of focusable elements with display:flex are focusable in IE10-11,
        // even though their tabIndex property suggests otherwise
        if (hasCssDisplayFlex(parentStyle)) {
          // value of tabindex takes precedence
          return hasTabbableTabindex;
        }
      }
    }

    // https://www.w3.org/WAI/PF/aria-practices/#focus_tabindex
    return element.tabIndex >= 0;
  }

  // bind exceptions to an iterator callback
  isTabbableRules.except = function(except = {}) {
    const isTabbable = function(context) {
      return isTabbableRules({
        context,
        except,
      });
    };

    isTabbable.rules = isTabbableRules;
    return isTabbable;
  };

  const isFocusRelevantWithoutFlexbox = isFocusRelevant.rules.except({flexbox: true});
  const isTabbableWithoutFlexbox = isTabbableRules.except({flexbox: true});

  // provide isTabbable(context) as default iterator callback
  const isTabbable = isTabbableRules.except({});

  function queryTabbable({
    context,
    includeContext,
    includeOnlyTabbable,
    strategy,
  } = {}) {
    const _isTabbable = isTabbable.rules.except({
      onlyTabbable: includeOnlyTabbable,
    });

    return queryFocusable({
      context,
      includeContext,
      includeOnlyTabbable,
      strategy,
    }).filter(_isTabbable);
  }

  function hasAutofocus(element) {
    // [autofocus] actually only works on form element, but who cares?
    return element.hasAttribute('autofocus');
  }

  function hasNoPositiveTabindex(element) {
    return element.tabIndex <= 0;
  }

  function queryFirstTabbable({
    context,
    sequence,
    strategy,
    ignoreAutofocus,
    defaultToContext,
    includeOnlyTabbable,
  } = {}) {
    let index = -1;

    if (!sequence) {
      context = nodeArray(context || document.body)[0];
      sequence = queryTabbable({
        context,
        includeOnlyTabbable,
        strategy,
      });
    }

    if (sequence.length && !ignoreAutofocus) {
      // prefer [autofocus]
      index = findIndex(sequence, hasAutofocus);
    }

    if (sequence.length && index === -1) {
      // ignore positive [tabindex]
      index = findIndex(sequence, hasNoPositiveTabindex);
    }

    const _isFocusable = isFocusable.rules.except({
      onlyTabbable: includeOnlyTabbable,
    });

    if (index === -1 && defaultToContext && context && _isFocusable(context)) {
      return context;
    }

    return sequence[index] || null;
  }

  function getShadowHost({context} = {}) {
    let element = contextToElement({
      label: 'get/shadow-host',
      context,
    });

    // walk up to the root
    let container = null;

    while (element) {
      container = element;
      element = element.parentNode;
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/Node.nodeType
    // NOTE: Firefox 34 does not expose ShadowRoot.host (but 37 does)
    if (container.nodeType === container.DOCUMENT_FRAGMENT_NODE && container.host) {
      // the root is attached to a fragment node that has a host
      return container.host;
    }

    return null;
  }

  function isActiveElement(context) {
    const element = contextToElement({
      label: 'is/active-element',
      resolveDocument: true,
      context,
    });

    const _document = getDocument(element);
    if (_document.activeElement === element) {
      return true;
    }

    const shadowHost = getShadowHost({ context: element });
    if (shadowHost && shadowHost.shadowRoot.activeElement === element) {
      return true;
    }

    return false;
  }

  // sorts a list of elements according to their order in the DOM

  function compareDomPosition(a, b) {
    return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
  }

  function sortDomOrder(elements) {
    return elements.sort(compareDomPosition);
  }

  function getFirstSuccessorOffset(list, target) {
    // find the first element that comes AFTER the target element
    return findIndex(list, function(element) {
      return target.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING;
    });
  }

  function findInsertionOffsets(list, elements, resolveElement) {
    // instead of mutating the elements list directly, remember position and map
    // to inject later, when we can do this more efficiently
    const insertions = [];
    elements.forEach(function(element) {
      let replace = true;
      let offset = list.indexOf(element);

      if (offset === -1) {
        // element is not in target list
        offset = getFirstSuccessorOffset(list, element);
        replace = false;
      }

      if (offset === -1) {
        // there is no successor in the tabsequence,
        // meaning the image must be the last element
        offset = list.length;
      }

      // allow the consumer to replace the injected element
      const injections = nodeArray(resolveElement ? resolveElement(element) : element);
      if (!injections.length) {
        // we can't inject zero elements
        return;
      }

      insertions.push({
        offset,
        replace,
        elements: injections,
      });
    });

    return insertions;
  }

  function insertElementsAtOffsets(list, insertions) {
    // remember the number of elements we have already injected
    // so we account for the caused index offset
    let inserted = 0;
    // make sure that we insert the elements in sequence,
    // otherwise the offset compensation won't work
    insertions.sort((a, b) => a.offset - b.offset);
    insertions.forEach(function(insertion) {
      // array.splice has an annoying function signature :(
      const remove = insertion.replace ? 1 : 0;
      const args = [insertion.offset + inserted, remove].concat(insertion.elements);
      list.splice.apply(list, args);
      inserted += insertion.elements.length - remove;
    });
  }

  function mergeInDomOrder({list, elements, resolveElement} = {}) {
    // operate on a copy so we don't mutate the original array
    const _list = list.slice(0);
    // make sure the elements we're injecting are provided in DOM order
    const _elements = nodeArray(elements).slice(0);
    sortDomOrder(_elements);
    // find the offsets within the target array (list) at which to inject
    // each individual element (from elements)
    const insertions = findInsertionOffsets(_list, _elements, resolveElement);
    // actually inject the elements into the target array at the identified positions
    insertElementsAtOffsets(_list, insertions);
    return _list;
  }

  class Maps {
    constructor(context) {
      this._document = getDocument(context);
      this.maps = {};
    }

    getAreasFor(name) {
      if (!this.maps[name]) {
        // the map is not defined within the context, so we
        // have to go find it elsewhere in the document
        this.addMapByName(name);
      }

      return this.maps[name];
    }

    addMapByName(name) {
      const map = getMapByName(name, this._document);
      if (!map) {
        // if there is no map, the img[usemap] wasn't doing anything anyway
        return;
      }

      this.maps[map.name] = queryTabbable({context: map});
    }

    extractAreasFromList(elements) {
      // remove all <area> elements from the elements list,
      // but put them the map for later retrieval
      return elements.filter(function(element) {
        const nodeName = element.nodeName.toLowerCase();
        if (nodeName !== 'area') {
          return true;
        }

        const map = element.parentNode;
        if (!this.maps[map.name]) {
          this.maps[map.name] = [];
        }

        this.maps[map.name].push(element);
        return false;
      }, this);
    }
  }

  function sortArea(elements, context) {
    // images - unless they are focusable themselves, likely not
    // part of the elements list, so we'll have to find them and
    // sort them into the elements list manually
    const usemaps = context.querySelectorAll('img[usemap]');
    const maps = new Maps(context);

    // remove all <area> elements from the elements list,
    // but put them the map for later retrieval
    const _elements = maps.extractAreasFromList(elements);

    if (!usemaps.length) {
      // the context does not contain any <area>s so no need
      // to replace anything, just remove any maps
      return _elements;
    }

    return mergeInDomOrder({
      list: _elements,
      elements: usemaps,
      resolveElement: function(image) {
        const name = image.getAttribute('usemap').slice(1);
        return maps.getAreasFor(name);
      },
    });
  }

  class Shadows {
    constructor(context, sortElements) {
      // document context we're working with
      this.context = context;
      // callback that sorts an array of elements
      this.sortElements = sortElements;
      // reference to create unique IDs for each ShadowHost
      this.hostCounter = 1;
      // reference map for child-ShadowHosts of a ShadowHost
      this.inHost = {};
      // reference map for child-ShadowHost of the document
      this.inDocument = [];
      // reference map for ShadowHosts
      this.hosts = {};
      // reference map for tabbable elements of a ShadowHost
      this.elements = {};
    }

    // remember which hosts we have to sort within later
    _registerHost(host) {
      if (host._sortingId) {
        return;
      }

      // make the ShadowHost identifiable (see cleanup() for undo)
      host._sortingId = 'shadow-' + (this.hostCounter++);
      this.hosts[host._sortingId] = host;

      // hosts may contain other hosts
      const parentHost = getShadowHost({context: host});
      if (parentHost) {
        this._registerHost(parentHost);
        this._registerHostParent(host, parentHost);
      } else {
        this.inDocument.push(host);
      }
    }

    // remember which host is the child of which other host
    _registerHostParent(host, parent) {
      if (!this.inHost[parent._sortingId]) {
        this.inHost[parent._sortingId] = [];
      }

      this.inHost[parent._sortingId].push(host);
    }

    // remember which elements a host contains
    _registerElement(element, host) {
      if (!this.elements[host._sortingId]) {
        this.elements[host._sortingId] = [];
      }

      this.elements[host._sortingId].push(element);
    }

    // remove shadowed elements from the sequence and register
    // the ShadowHosts they belong to so we know what to sort
    // later on
    extractElements(elements) {
      return elements.filter(function(element) {
        const host = getShadowHost({ context: element });
        if (!host) {
          return true;
        }

        this._registerHost(host);
        this._registerElement(element, host);
        return false;
      }, this);
    }

    // inject hosts into the sequence, sort everything,
    // and recoursively replace hosts by its descendants
    sort(elements) {
      let _elements = this._injectHosts(elements);
      _elements = this._replaceHosts(_elements);
      this._cleanup();
      return _elements;
    }

    // merge ShadowHosts into the element lists of other ShadowHosts
    // or the document, then sort the individual lists
    _injectHosts(elements) {
      Object.keys(this.hosts).forEach(function(_sortingId) {
        const _list = this.elements[_sortingId];
        const _elements = this.inHost[_sortingId];
        const _context = this.hosts[_sortingId].shadowRoot;
        this.elements[_sortingId] = this._merge(_list, _elements, _context);
      }, this);

      return this._merge(elements, this.inDocument, this.context);
    }

    _merge(list, elements, context) {
      const merged = mergeInDomOrder({
        list,
        elements,
      });

      return this.sortElements(merged, context);
    }

    _replaceHosts(elements) {
      return mergeInDomOrder({
        list: elements,
        elements: this.inDocument,
        resolveElement: this._resolveHostElement.bind(this),
      });
    }

    _resolveHostElement(host) {
      const merged = mergeInDomOrder({
        list: this.elements[host._sortingId],
        elements: this.inHost[host._sortingId],
        resolveElement: this._resolveHostElement.bind(this),
      });

      const _tabindex = tabindexValue(host);
      if (_tabindex !== null && _tabindex > -1) {
        return [host].concat(merged);
      }

      return merged;
    }

    _cleanup() {
      // remove those identifers we put on the ShadowHost to avoid using Map()
      Object.keys(this.hosts).forEach(function(key) {
        delete this.hosts[key]._sortingId;
      }, this);
    }
  }

  function sortShadowed(elements, context, sortElements) {
    const shadows = new Shadows(context, sortElements);
    const _elements = shadows.extractElements(elements);

    if (_elements.length === elements.length) {
      // no shadowed content found, no need to continue
      return sortElements(elements);
    }

    return shadows.sort(_elements);
  }

  function sortTabindex(elements) {
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement.tabIndex
    // elements with tabIndex "0" (including tabbableElements without tabIndex) should be navigated in the order they appear.
    // elements with a positive tabIndex:
    //   Elements that have identical tabIndexes should be navigated in the order they appear.
    //   Navigation proceeds from the lowest tabIndex to the highest tabIndex.

    // NOTE: sort implementation may be unstable and thus mess up DOM order,
    // that's why we build a map that's being sorted instead. If we were able to rely
    // on a stable sorting algorithm, sortTabindex() could be as simple as
    // elements.sort(function(a, b) { return a.tabIndex - b.tabIndex; });
    // at this time Chrome does not use a stable sorting algorithm
    // see http://blog.rodneyrehm.de/archives/14-Sorting-Were-Doing-It-Wrong.html#stability

    // NOTE: compareDocumentPosition seemed like more overhead than just sorting this with buckets
    // https://developer.mozilla.org/en-US/docs/Web/API/Node.compareDocumentPosition

    const map = {};
    const indexes = [];
    const normal = elements.filter(function(element) {
      // in Trident and Gecko SVGElement does not know about the tabIndex property
      let tabIndex = element.tabIndex;
      if (tabIndex === undefined) {
        tabIndex = tabindexValue(element);
      }

      // extract elements that don't need sorting
      if (tabIndex <= 0 || tabIndex === null || tabIndex === undefined) {
        return true;
      }

      if (!map[tabIndex]) {
        // create sortable bucket for dom-order-preservation of elements with the same tabIndex
        map[tabIndex] = [];
        // maintain a list of unique tabIndexes
        indexes.push(tabIndex);
      }

      // sort element into the proper bucket
      map[tabIndex].push(element);
      // element moved to sorting map, so not "normal" anymore
      return false;
    });

    // sort the tabindex ascending,
    // then resolve them to their appropriate buckets,
    // then flatten the array of arrays to an array
    const _elements = indexes.sort().map(function(tabIndex) {
      return map[tabIndex];
    }).reduceRight(function(previous, current) {
      return current.concat(previous);
    }, normal);

    return _elements;
  }

  let supports$8;

  function moveContextToBeginning(elements, context) {
    const pos = elements.indexOf(context);
    if (pos > 0) {
      const tmp = elements.splice(pos, 1);
      return tmp.concat(elements);
    }

    return elements;
  }

  function sortElements(elements, _context) {
    if (supports$8.tabsequenceAreaAtImgPosition) {
      // Some browsers sort <area> in DOM order, some place the <area>s
      // where the <img> referecing them would've been in DOM order.
      // https://github.com/medialize/ally.js/issues/5
      elements = sortArea(elements, _context);
    }

    elements = sortTabindex(elements);
    return elements;
  }

  function queryTabsequence({
    context,
    includeContext,
    includeOnlyTabbable,
    strategy,
  } = {}) {
    if (!supports$8) {
      supports$8 = _supports();
    }

    const _context = nodeArray(context)[0] || document.documentElement;
    let elements = queryTabbable({
      context: _context,
      includeContext,
      includeOnlyTabbable,
      strategy,
    });

    if (document.body.createShadowRoot && platform$1.is.BLINK) {
      // sort tabindex localized to shadow dom
      // see https://github.com/medialize/ally.js/issues/6
      elements = sortShadowed(elements, _context, sortElements);
    } else {
      elements = sortElements(elements, _context);
    }

    if (includeContext) {
      // if we include the context itself, it has to be the first
      // element of the sequence
      elements = moveContextToBeginning(elements, _context);
    }

    return elements;
  }

  // codes mostly cloned from https://github.com/keithamus/jwerty/blob/master/jwerty.js
  // deliberately not exposing characters like <,.-#* because they vary *wildly*
  // across keyboard layouts and may cause various problems
  // (e.g. "*" is "Shift +" on a German Mac keyboard)
  // (e.g. "@" is "Alt L" on a German Mac keyboard)

  const keycode = {
    // Element Focus
    tab: 9,

    // Navigation
    left: 37,
    up: 38,
    right: 39,
    down: 40,
    pageUp: 33,
    'page-up': 33,
    pageDown: 34,
    'page-down': 34,
    end: 35,
    home: 36,

    // Action
    enter: 13,
    escape: 27,
    space: 32,

    // Modifier
    shift: 16,
    capsLock: 20,
    'caps-lock': 20,
    ctrl: 17,
    alt: 18,
    meta: 91,
    // in firefox: 224
    // on mac (chrome): meta-left=91, meta-right=93
    // on win (IE11): meta-left=91, meta-right=92
    pause: 19,

    // Content Manipulation
    insert: 45,
    'delete': 46,
    backspace: 8,

    // the same logical key may be identified through different keyCodes
    _alias: {
      91: [92, 93, 224],
    },
  };

  // Function keys (112 - 137)
  // NOTE: not every keyboard knows F13+
  for (let n = 1; n < 26; n++) {
    keycode['f' + n] = n + 111;
  }

  // Number keys (48-57, numpad 96-105)
  // NOTE: not every keyboard knows num-0+
  for (let n = 0; n < 10; n++) {
    const code = n + 48;
    const numCode = n + 96;
    keycode[n] = code;
    keycode['num-' + n] = numCode;
    keycode._alias[code] = [numCode];
  }

  // Latin characters (65 - 90)
  for (let n = 0; n < 26; n++) {
    const code = n + 65;
    const name = String.fromCharCode(code).toLowerCase();
    keycode[name] = code;
  }

  const modifier = {
    alt: 'altKey',
    ctrl: 'ctrlKey',
    meta: 'metaKey',
    shift: 'shiftKey',
  };

  const modifierSequence = Object.keys(modifier).map(name => modifier[name]);

  function createExpectedModifiers(ignoreModifiers) {
    const value = ignoreModifiers ? null : false;
    return {
      altKey: value,
      ctrlKey: value,
      metaKey: value,
      shiftKey: value,
    };
  }

  function resolveModifiers(modifiers) {
    const ignoreModifiers = modifiers.indexOf('*') !== -1;
    const expected = createExpectedModifiers(ignoreModifiers);

    modifiers.forEach(function(token) {
      if (token === '*') {
        // we've already covered the all-in operator
        return;
      }

      // we want the modifier pressed
      let value = true;
      const operator = token.slice(0, 1);
      if (operator === '?') {
        // we don't care if the modifier is pressed
        value = null;
      } else if (operator === '!') {
        // we do not want the modifier pressed
        value = false;
      }

      if (value !== true) {
        // compensate for the modifier's operator
        token = token.slice(1);
      }

      const propertyName = modifier[token];
      if (!propertyName) {
        throw new TypeError('Unknown modifier "' + token + '"');
      }

      expected[propertyName] = value;
    });

    return expected;
  }

  function resolveKey(key) {
    const code = keycode[key] || parseInt(key, 10);
    if (!code || typeof code !== 'number' || isNaN(code)) {
      throw new TypeError('Unknown key "' + key + '"');
    }

    return [code].concat(keycode._alias[code] || []);
  }

  function matchModifiers(expected, event) {
    // returns true on match
    return !modifierSequence.some(function(prop) {
      // returns true on mismatch
      return typeof expected[prop] === 'boolean' && Boolean(event[prop]) !== expected[prop];
    });
  }

  function keyBinding(text) {
    return text.split(/\s+/).map(function(_text) {
      const tokens = _text.split('+');
      const _modifiers = resolveModifiers(tokens.slice(0, -1));
      const _keyCodes = resolveKey(tokens.slice(-1));
      return {
        keyCodes: _keyCodes,
        modifiers: _modifiers,
        matchModifiers: matchModifiers.bind(null, _modifiers),
      };
    });
  }

  // Node.compareDocumentPosition is available since IE9
  // see https://developer.mozilla.org/en-US/docs/Web/API/Node.compareDocumentPosition

  // callback returns true when element is contained by parent or is the parent suited for use with Array.some()
  /*
    USAGE:
      var isChildOf = getParentComparator({parent: someNode});
      listOfElements.some(isChildOf)
  */

  function getParentComparator({parent, element, includeSelf} = {}) {
    if (parent) {
      return function isChildOf(node) {
        return Boolean(
          includeSelf && node === parent
          || parent.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_CONTAINED_BY
        );
      };
    } else if (element) {
      return function isParentOf(node) {
        return Boolean(
          includeSelf && element === node
          || node.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_CONTAINED_BY
        );
      };
    }

    throw new TypeError('util/compare-position#getParentComparator required either options.parent or options.element');
  }

  // Bug 286933 - Key events in the autocomplete popup should be hidden from page scripts
  // @browser-issue Gecko https://bugzilla.mozilla.org/show_bug.cgi?id=286933

  function whenKey(map = {}) {
    const bindings = {};

    const context = nodeArray(map.context)[0] || document.documentElement;
    delete map.context;
    const filter = nodeArray(map.filter);
    delete map.filter;

    const mapKeys = Object.keys(map);
    if (!mapKeys.length) {
      throw new TypeError('when/key requires at least one option key');
    }

    const registerBinding = function(event) {
      event.keyCodes.forEach(function(code) {
        if (!bindings[code]) {
          bindings[code] = [];
        }

        bindings[code].push(event);
      });
    };

    mapKeys.forEach(function(text) {
      if (typeof map[text] !== 'function') {
        throw new TypeError('when/key requires option["' + text + '"] to be a function');
      }

      const addCallback = function(event) {
        event.callback = map[text];
        return event;
      };

      keyBinding(text)
        .map(addCallback)
        .forEach(registerBinding);
    });

    const handleKeyDown = function(event) {
      if (event.defaultPrevented) {
        return;
      }

      if (filter.length) {
        // ignore elements within the exempted sub-trees
        const isParentOfElement = getParentComparator({element: event.target, includeSelf: true});
        if (filter.some(isParentOfElement)) {
          return;
        }
      }

      const key = event.keyCode || event.which;
      if (!bindings[key]) {
        return;
      }

      bindings[key].forEach(function(_event) {
        if (!_event.matchModifiers(event)) {
          return;
        }

        _event.callback.call(context, event, disengage);
      });
    };

    context.addEventListener('keydown', handleKeyDown, false);

    const disengage = function() {
      context.removeEventListener('keydown', handleKeyDown, false);
    };

    return { disengage };
  }

  function maintainTabFocus({ context } = {}) {
    if (!context) {
      context = document.documentElement;
    }

    // Make sure the supports tests are run before intercepting the Tab key,
    // or IE10 and IE11 will fail to process the first Tab key event. Not
    // limiting this warm-up to IE because it may be a problem elsewhere, too.
    queryTabsequence();

    return whenKey({
      // Safari on OSX may require ALT+TAB to reach links,
      // see https://github.com/medialize/ally.js/issues/146
      '?alt+?shift+tab': function(event) {
        // we're completely taking over the Tab key handling
        event.preventDefault();

        const sequence = queryTabsequence({
          context,
        });

        const backward = event.shiftKey;
        const first = sequence[0];
        const last = sequence[sequence.length - 1];

        // wrap around first to last, last to first
        const source = backward ? first : last;
        const target = backward ? last : first;
        if (isActiveElement(source)) {
          target.focus();
          return;
        }

        // find current position in tabsequence
        let currentIndex;
        const found = sequence.some(function(element, index) {
          if (!isActiveElement(element)) {
            return false;
          }

          currentIndex = index;
          return true;
        });

        if (!found) {
          // redirect to first as we're not in our tabsequence
          first.focus();
          return;
        }

        // shift focus to previous/next element in the sequence
        const offset = backward ? -1 : 1;
        sequence[currentIndex + offset].focus();
      },
    });
  }

  // Polyfill requestAnimationFrame for oldIE
  // adapted from https://gist.github.com/paulirish/1579671
  // requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
  // original source was published under the MIT license
  // https://paulirish.com/2011/requestanimationframe-for-smart-animating/
  // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

  typeof window !== 'undefined' && (function() {
    let lastTime = 0;
    const vendors = ['ms', 'moz', 'webkit', 'o'];
    let requestAnimationFrameName = '';
    let cancelAnimationFrameName = '';

    for (let x = 0, length = vendors.length; x < length; ++x) {
      requestAnimationFrameName = window[vendors[x] + 'RequestAnimationFrame'];
      cancelAnimationFrameName = window[vendors[x] + 'CancelAnimationFrame']
        || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (typeof window.requestAnimationFrame !== 'function') {
      window.requestAnimationFrame = window[requestAnimationFrameName] || function(callback) {
        const currTime = new Date().getTime();
        const timeToCall = Math.max(0, 16 - (currTime - lastTime));
        const id = window.setTimeout(function() {
          callback(currTime + timeToCall);
        }, timeToCall);

        lastTime = currTime + timeToCall;
        return id;
      };
    }

    if (typeof window.cancelAnimationFrame !== 'function') {
      window.cancelAnimationFrame = window[cancelAnimationFrameName] || function(id) {
        clearTimeout(id);
      };
    }
  })();

  function getIntersectingRect(one, two) {
    // identify the rectangle that _element and _container overlap in
    const top = Math.max(one.top, two.top);
    const left = Math.max(one.left, two.left);
    // make sure bottom can't be above top, right can't be before left
    const right = Math.max(Math.min(one.right, two.right), left);
    const bottom = Math.max(Math.min(one.bottom, two.bottom), top);
    // return something resembling ClientRect
    return {
      top: top,
      right: right,
      bottom: bottom,
      left: left,
      width: right - left,
      height: bottom - top,
    };
  }

  function getViewportRect() {
    const width = window.innerWidth || document.documentElement.clientWidth;
    const height = window.innerHeight || document.documentElement.clientHeight;
    // return something resembling ClientRect
    return {
      top: 0,
      right: width,
      bottom: height,
      left: 0,
      width: width,
      height: height,
    };
  }

  function getInnerBoundingClientRect(element) {
    // convenience for the .reduce() in getScrollableParentRect()
    const rect = element.getBoundingClientRect();

    // remove the width of the scrollbar because that
    // area is not really considered visible
    // NOTE: assuming scrollbar is always to the right and bottom
    const scrollbarWidth = element.offsetWidth - element.clientWidth;
    const scrollbarHeight = element.offsetHeight - element.clientHeight;
    // cannot mutate rect because it has readonly properties
    const _rect = {
      top: rect.top,
      left: rect.left,
      right: rect.right - scrollbarWidth,
      bottom: rect.bottom - scrollbarHeight,
      width: rect.width - scrollbarWidth,
      height: rect.height - scrollbarHeight,
      area: 0,
    };

    _rect.area = _rect.width * _rect.height;
    return _rect;
  }

  function isOverflowingElement(element) {
    const style = window.getComputedStyle(element, null);
    const value = 'visible';
    return style.getPropertyValue('overflow-x') !== value
      && style.getPropertyValue('overflow-y') !== value;
  }

  function isScrollableElement(element) {
    // an element not scrollable if it doesn't crop its content
    if (!isOverflowingElement(element)) {
      return false;
    }

    // an element is scrollable when it is smaller than its content
    return element.offsetHeight < element.scrollHeight
      || element.offsetWidth < element.scrollWidth;
  }

  function getScrollableParentRect(element) {
    // get largest possible space constrained by scrolling containers

    // find scrollable parents
    const scrollingContainers = getParents({context: element}).slice(1).filter(isScrollableElement);

    if (!scrollingContainers.length) {
      // no containers, no joy
      return null;
    }

    // identify the currently visible intersection of all scrolling container parents
    return scrollingContainers.reduce(function(previous, current) {
      const rect = getInnerBoundingClientRect(current);
      const intersection = getIntersectingRect(rect, previous);
      // identify the smallest scrolling container so we know how much space
      // our element can fill at the most - note that this is NOT the area
      // of the intersection, intersection is just abused as a vehicle
      intersection.area = Math.min(rect.area, previous.area);
      return intersection;
    }, getInnerBoundingClientRect(scrollingContainers[0]));
  }

  function visibleArea(element) {
    // dimensions of the element itself
    const _element = element.getBoundingClientRect();
    // dimensions of the viewport
    const _viewport = getViewportRect();
    // we need the area to know how much of the element can be displayed at the most
    _viewport.area = _viewport.width * _viewport.height;

    let _area = _viewport;
    // dimensions of the intersection of all scrollable parents
    const _container = getScrollableParentRect(element);
    if (_container) {
      if (!_container.width || !_container.height) {
        // scrollable containers without dimensions are invisible,
        // meaning that the element is not visible at all
        return 0;
      }

      // dimension the element can currently be rendered in
      _area = getIntersectingRect(_container, _viewport);
      _area.area = _container.area;
    }

    // dimension of the element currently rendered in identified space
    const _visible = getIntersectingRect(_element, _area);
    if (!_visible.width || !_visible.height) {
      // element is not shown within the identified area
      return 0;
    }

    // compare the element's currently visible size to the size it
    // could take up at the most, being either the element's actual
    // size, or the space theroetically made available if all
    // scrollable parents are aligned properly
    const area = _element.width * _element.height;
    const maxArea = Math.min(area, _area.area);
    // Firefox may return sub-pixel bounding client rect
    const visibleArea = Math.round(_visible.width) * Math.round(_visible.height) / maxArea;
    // Edge might not reach 0.5 exactly
    const factor = 10000;
    const roundedVisibleArea = Math.round(visibleArea * factor) / factor;
    // clamp the value at 1
    return Math.min(roundedVisibleArea, 1);
  }

  function whenVisibleArea({context, callback, area} = {}) {
    if (typeof callback !== 'function') {
      throw new TypeError('when/visible-area requires options.callback to be a function');
    }

    if (typeof area !== 'number') {
      area = 1;
    }

    const element = contextToElement({
      label: 'when/visible-area',
      context,
    });

    let raf;
    let evaluate = null;
    const disengage = function() {
      raf && cancelAnimationFrame(raf);
    };

    const predicate = function() {
      return !isVisible(element) || visibleArea(element) < area || callback(element) === false;
    };

    const checkPredicate = function() {
      if (predicate()) {
        evaluate();
        return;
      }

      disengage();
    };

    evaluate = function() {
      raf = requestAnimationFrame(checkPredicate);
    };

    evaluate();
    return { disengage };
  }

  const AlpineFocusModal = () => {
    return {
      lastActiveElement: null,
      trapFocus: null,

      openModal(callback) {
        if (typeof callback !== 'function') {
          throw new TypeError('openModal requires options.callback to be a function');
        } // Checks if [x-ref="dialog"] exists


        if (!this.$refs.dialog) return; // Gets the focused element before dialog opens

        this.lastActiveElement = document.activeElement; // Callback before dialog opens.

        callback(); // Run's after Alpine's magic things

        this.$nextTick(() => {
          // Traps focus to [x-ref="dialog"]
          this.trapFocus = maintainTabFocus({
            context: this.$refs.dialog
          }); // Wait's until find visible items in dialog

          whenVisibleArea({
            context: this.$refs.dialog,
            // Finds the first tabbable element
            callback: function (element) {
              let target = queryFirstTabbable({
                context: element,
                defaultToContext: true,
                strategy: 'quick'
              }); // And set's to the first focused element

              if (target) target.focus();
            }
          });
        });
      },

      closeModal(callback) {
        if (typeof callback !== 'function') {
          throw new TypeError('openModal requires options.callback to be a function');
        } // Callback before dialog closes.


        callback();
        this.$nextTick(() => {
          this.trapFocus.disengage();
          if (this.lastActiveElement) this.lastActiveElement.focus();
        });
      }

    };
  };

  window.AlpineFocusModal = AlpineFocusModal;

  return AlpineFocusModal;

})));
