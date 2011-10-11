/**
 * @name cartodb-gmapsv3 for Google Maps V3 API
 * @version 0.1 [October 10, 2011]
 * @author: xavijam@gmail.com
 * @fileoverview <b>Author:</b> xavijam@gmail.com<br/> <b>Licence:</b>
 *               Licensed under <a
 *               href="http://opensource.org/licenses/mit-license.php">MIT</a>
 *               license.<br/> This library lets you use CartoDB with google
 *               maps v3.
 *                 
 */
/**
 * @name google
 * @class The fundamental namespace for Google APIs 
 */
/**
 * @name google.maps
 * @class The fundamental namespace for Google Maps V3 API 
 */
 /*
 *  - Map style of cartodb
 *  - Infowindow of cartodb
 *  - Tiles style of cartodb
 */
 
 
 
if (typeof(google.maps.CartoDBLayer) === "undefined") {
  /**
   * @params {}
   *		map						-			Your gmapsv3 map
   *   	user_name 		-		 	CartoDB user name
   *   	table_name 		-			CartoDB table name
   *    query					-			If you want to apply any sql sentence to the table...
   *		map_style			-			If you want to see the map styles created on cartodb (opcional - default = false)
   *		infowindow		-			If you want to see infowindows when click in a geometry (opcional - default = false)
   *		auto_bound		-			Let cartodb auto-bound-zoom in the map (opcional - default = false)
   */
   
  google.maps.CartoDBLayer = function (params) {
	  
		addCartoDBTiles();																		// Always add cartodb tiles.
		if (params.map_style) 	setCartoDBMapStyle(params);		// Map style? ok, let's style.
		if (params.auto_bound) 	autoBound(params);						// Bounds? CartoDB does it.
		
	  
	  
	  // Add cartodb tiles to the map
	  function addCartoDBTiles(params) {
		  // Add the cartodb tiles
	    var cartodb_layer = {
	      getTileUrl: function(coord, zoom) {
	        return 'http://' + params.user_name + '.cartodb.com/tiles/' + params.table_name + '/'+zoom+'/'+coord.x+'/'+coord.y+'.png8?';
	      },
	      tileSize: new google.maps.Size(256, 256)
	    };
	    var cartodb_imagemaptype = new google.maps.ImageMapType(cartodb_layer);
	    params.map.overlayMapTypes.insertAt(0, cartodb_imagemaptype);
	  }
	  
	  
	  // Zoom to cartodb geometries
	  function autoBound(params) {
			// Zoom to your geometries
		  reqwest({
			  method:'get',
		    url: 'https://'+params.user_name+'.cartodb.com/api/v1/sql/?q='+escape('select ST_Extent(the_geom) from '+ params.table_name)+'&callback=?',
		    type: 'jsonp',
		    success: function(result) {
		      if (result.rows[0].st_extent!=null) {
		        var coordinates = result.rows[0].st_extent.replace('BOX(','').replace(')','').split(',');
		  
		        var coor1 = coordinates[0].split(' ');
		        var coor2 = coordinates[1].split(' ');
		        var bounds = new google.maps.LatLngBounds();
		  
		        // Check bounds
		        if (coor1[0] >  180 || coor1[0] < -180 || coor1[1] >  90 || coor1[1] < -90 
			        || coor2[0] >  180 || coor2[0] < -180 || coor2[1] >  90  || coor2[1] < -90) {
		          coor1[0] = '-30';
		          coor1[1] = '-50'; 
		          coor2[0] = '110'; 
		          coor2[1] =  '80'; 
		        }
		  
		        bounds.extend(new google.maps.LatLng(coor1[1],coor1[0]));
		        bounds.extend(new google.maps.LatLng(coor2[1],coor2[0]));
		  
		        params.map.fitBounds(bounds);
		      }
		  
		    },
		    error: function(e) {}
		  });	    
	  }
	  
	  
	  function setCartoDBMapStyle(params) {
		  reqwest({
		    url:'https://' + params.user_name + '.cartodb.com/tiles/' + params.table_name + '/map_metadata?callback=?',
		    type: 'jsonp',
		    success:function(result){
		      var map_style = JSON.parse(result.map_metadata);
		      
		      if (!map_style || map_style.google_maps_base_type=="roadmap") {
		        params.map.setOptions({mapTypeId: google.maps.MapTypeId.ROADMAP});
		      } else if (map_style.google_maps_base_type=="satellite") {
		        params.map.setOptions({mapTypeId: google.maps.MapTypeId.SATELLITE});
		      } else if (map_style.google_maps_base_type=="terrain") {
		        params.map.setOptions({mapTypeId: google.maps.MapTypeId.TERRAIN});
		      } else {
		        var mapStyles = [ { stylers: [ { saturation: -65 }, { gamma: 1.52 } ] },{ featureType: "administrative", stylers: [ { saturation: -95 }, { gamma: 2.26 } ] },{ featureType: "water", elementType: "labels", stylers: [ { visibility: "off" } ] },{ featureType: "administrative.locality", stylers: [ { visibility: "off" } ] },{ featureType: "road", stylers: [ { visibility: "simplified" }, { saturation: -99 }, { gamma: 2.22 } ] },{ featureType: "poi", elementType: "labels", stylers: [ { visibility: "off" } ] },{ featureType: "road.arterial", stylers: [ { visibility: "off" } ] },{ featureType: "road.local", elementType: "labels", stylers: [ { visibility: "off" } ] },{ featureType: "transit", stylers: [ { visibility: "off" } ] },{ featureType: "road", elementType: "labels", stylers: [ { visibility: "off" } ] },{ featureType: "poi", stylers: [ { saturation: -55 } ] } ];
		        map_style.google_maps_customization_style = mapStyles;
		        params.map.setOptions({mapTypeId: google.maps.MapTypeId.ROADMAP});
		      }
		      
		      // Custom tiles
		      if (!map_style) {map_style = {google_maps_customization_style: []}}
		      params.map.setOptions({styles: map_style.google_maps_customization_style})
		    },
		    error: function(e){}
		  });
	  }
  };
}









/**
 * Ender reqwest.js
 * Ajax request
 **/


!function (name, definition) {
  if (typeof define == 'function') define(definition)
  else if (typeof module != 'undefined') module.exports = definition()
  else this[name] = definition()
	}('reqwest', function () {

  var context = this
    , win = window
    , doc = document
    , old = context.reqwest
    , twoHundo = /^20\d$/
    , byTag = 'getElementsByTagName'
    , readyState = 'readyState'
    , contentType = 'Content-Type'
    , head = doc[byTag]('head')[0]
    , uniqid = 0
    , lastValue // data stored by the most recent JSONP callback
    , xhr = ('XMLHttpRequest' in win) ?
        function () {
          return new XMLHttpRequest()
        } :
        function () {
          return new ActiveXObject('Microsoft.XMLHTTP')
        }

  function handleReadyState(o, success, error) {
    return function () {
      if (o && o[readyState] == 4) {
        if (twoHundo.test(o.status)) {
          success(o)
        } else {
          error(o)
        }
      }
    }
  }

  function setHeaders(http, o) {
    var headers = o.headers || {},
     mimetypes= {
      			xml: "application/xml, text/xml",
      			html: "text/html",
      			text: "text/plain",
      			json: "application/json, text/javascript",
      			js: 'application/javascript, text/javascript'
      		}
      headers.Accept = headers.Accept || mimetypes[o.type] || 'text/javascript, text/html, application/xml, text/xml, */*'

    // breaks cross-origin requests with legacy browsers
    if (!o.crossOrigin) {
      headers['X-Requested-With'] = headers['X-Requested-With'] || 'XMLHttpRequest'
    }
    headers[contentType] = headers[contentType] || 'application/x-www-form-urlencoded'
    for (var h in headers) {
      headers.hasOwnProperty(h) && http.setRequestHeader(h, headers[h])
    }
  }

  function getCallbackName(o, reqId) {
    var callbackVar = o.jsonpCallback || "callback"
    if (o.url.slice(-(callbackVar.length + 2)) == (callbackVar + "=?")) {
      // Generate a guaranteed unique callback name
      var callbackName = "reqwest_" + reqId

      // Replace the ? in the URL with the generated name
      o.url = o.url.substr(0, o.url.length - 1) + callbackName
      return callbackName
    } else {
      // Find the supplied callback name
      var regex = new RegExp(callbackVar + "=([\\w]+)")
      return o.url.match(regex)[1]
    }
  }

  // Store the data returned by the most recent callback
  function generalCallback(data) {
    lastValue = data
  }

  function getRequest(o, fn, err) {
    if (o.type == 'jsonp') {
      var script = doc.createElement('script')
        , loaded = 0
        , reqId = uniqid++

      // Add the global callback
      win[getCallbackName(o, reqId)] = generalCallback

      // Setup our script element
      script.type = 'text/javascript'
      script.src = o.url
      script.async = true
      if (typeof script.onreadystatechange !== 'undefined') {
          // need this for IE due to out-of-order onreadystatechange(), binding script
          // execution to an event listener gives us control over when the script
          // is executed. See http://jaubourg.net/2010/07/loading-script-as-onclick-handler-of.html
          script.event = 'onclick'
          script.htmlFor = script.id = '_reqwest_' + reqId
      }

      script.onload = script.onreadystatechange = function () {
        if ((script[readyState] && script[readyState] !== "complete" && script[readyState] !== "loaded") || loaded) {
          return false
        }
        script.onload = script.onreadystatechange = null
        script.onclick && script.onclick()
        // Call the user callback with the last value stored
        // and clean up values and scripts.
        o.success && o.success(lastValue)
        lastValue = undefined
        head.removeChild(script)
        loaded = 1
      }

      // Add the script to the DOM head
      head.appendChild(script)
    } else {
      var http = xhr()
        , method = (o.method || 'GET').toUpperCase()
        , url = (typeof o === 'string' ? o : o.url)
        // convert non-string objects to query-string form unless o.processData is false 
        , data = o.processData !== false && o.data && typeof o.data !== 'string'
          ? reqwest.toQueryString(o.data)
          : o.data || null

      // if we're working on a GET request and we have data then we should append
      // query string to end of URL and not post data
      method == 'GET' && data && data !== '' && (url += (/\?/.test(url) ? '&' : '?') + data) && (data = null)
      http.open(method, url, true)
      setHeaders(http, o)
      http.onreadystatechange = handleReadyState(http, fn, err)
      o.before && o.before(http)
      http.send(data)
      return http
    }
  }

  function Reqwest(o, fn) {
    this.o = o
    this.fn = fn
    init.apply(this, arguments)
  }

  function setType(url) {
    if (/\.json$/.test(url)) {
      return 'json'
    }
    if (/\.jsonp$/.test(url)) {
      return 'jsonp'
    }
    if (/\.js$/.test(url)) {
      return 'js'
    }
    if (/\.html?$/.test(url)) {
      return 'html'
    }
    if (/\.xml$/.test(url)) {
      return 'xml'
    }
    return 'js'
  }

  function init(o, fn) {
    this.url = typeof o == 'string' ? o : o.url
    this.timeout = null
    var type = o.type || setType(this.url)
      , self = this
    fn = fn || function () {}

    if (o.timeout) {
      this.timeout = setTimeout(function () {
        self.abort()
      }, o.timeout)
    }

    function complete(resp) {
      o.timeout && clearTimeout(self.timeout)
      self.timeout = null
      o.complete && o.complete(resp)
    }

    function success(resp) {
      var r = resp.responseText
      if (r) {
        switch (type) {
        case 'json':
          try {
            resp = win.JSON ? win.JSON.parse(r) : eval('(' + r + ')')          
          } catch(err) {
            return error(resp, 'Could not parse JSON in response', err)
          }
          break;
        case 'js':
          resp = eval(r)
          break;
        case 'html':
          resp = r
          break;
        }
      }

      fn(resp)
      o.success && o.success(resp)

      complete(resp)
    }

    function error(resp, msg, t) {
      o.error && o.error(resp, msg, t)
      complete(resp)
    }

    this.request = getRequest(o, success, error)
  }

  Reqwest.prototype = {
    abort: function () {
      this.request.abort()
    }

  , retry: function () {
      init.call(this, this.o, this.fn)
    }
  }

  function reqwest(o, fn) {
    return new Reqwest(o, fn)
  }

  // normalize newline variants according to spec -> CRLF
  function normalize(s) {
    return s ? s.replace(/\r?\n/g, '\r\n') : ''
  }

  var isArray = typeof Array.isArray == 'function' ? Array.isArray : function(a) {
    return Object.prototype.toString.call(a) == '[object Array]'
  }

  function serial(el, cb) {
    var n = el.name
      , t = el.tagName.toLowerCase()
      , optCb = function(o) {
          // IE gives value="" even where there is no value attribute
          // 'specified' ref: http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-862529273
          if (o && !o.disabled)
            cb(n, normalize(o.attributes.value && o.attributes.value.specified ? o.value : o.text))
        }


    // don't serialize elements that are disabled or without a name
    if (el.disabled || !n) return;

    switch (t) {
    case 'input':
      if (!/reset|button|image|file/i.test(el.type)) {
        var ch = /checkbox/i.test(el.type)
          , ra = /radio/i.test(el.type)
          , val = el.value;
        // WebKit gives us "" instead of "on if a checkbox has no value, so correct it here
        (!(ch || ra) || el.checked) && cb(n, normalize(ch && val === '' ? 'on' : val))
      }
      break;
    case 'textarea':
      cb(n, normalize(el.value))
      break;
    case 'select':
      if (el.type.toLowerCase() === 'select-one') {
        optCb(el.selectedIndex >= 0 ? el.options[el.selectedIndex] : null)
      } else {
        for (var i = 0; el.length && i < el.length; i++) {
          el.options[i].selected && optCb(el.options[i])
        }
      }
      break;
    }
  }

  // collect up all form elements found from the passed argument elements all
  // the way down to child elements; pass a '<form>' or form fields.
  // called with 'this'=callback to use for serial() on each element
  function eachFormElement() {
    var cb = this
      , serializeSubtags = function(e, tags) {
        for (var i = 0; i < tags.length; i++) {
          var fa = e[byTag](tags[i])
          for (var j = 0; j < fa.length; j++) serial(fa[j], cb)
        }
      }

    for (var i = 0; i < arguments.length; i++) {
      var e = arguments[i]
      if (/input|select|textarea/i.test(e.tagName)) serial(e, cb);
      serializeSubtags(e, [ 'input', 'select', 'textarea' ])
    }
  }

  // standard query string style serialization
  function serializeQueryString() {
    return reqwest.toQueryString(reqwest.serializeArray.apply(null, arguments))
  }

  // { 'name': 'value', ... } style serialization
  function serializeHash() {
    var hash = {}
    eachFormElement.apply(function(name, value) {
      if (name in hash) {
        hash[name] && !isArray(hash[name]) && (hash[name] = [hash[name]])
        hash[name].push(value)
      } else hash[name] = value
    }, arguments)
    return hash
  }

  // [ { name: 'name', value: 'value' }, ... ] style serialization
  reqwest.serializeArray = function () {
    var arr = []
    eachFormElement.apply(function(name, value) {
      arr.push({name: name, value: value})
    }, arguments)
    return arr 
  }

  reqwest.serialize = function () {
    if (arguments.length === 0) return "";
    var opt, fn
      , args = Array.prototype.slice.call(arguments, 0)

    opt = args.pop()
    opt && opt.nodeType && args.push(opt) && (opt = null)
    opt && (opt = opt.type)

    if (opt == 'map') fn = serializeHash
    else if (opt == 'array') fn = reqwest.serializeArray
    else fn = serializeQueryString

    return fn.apply(null, args)
  }

  reqwest.toQueryString = function(o) {
    var qs = '', i
      , enc = encodeURIComponent
      , push = function(k, v) {
          qs += enc(k) + '=' + enc(v) + '&'
        }

    if (isArray(o)) {
      for (i = 0; o && i < o.length; i++) push(o[i].name, o[i].value)
    } else {
      for (var k in o) {
        if (!Object.hasOwnProperty.call(o, k)) continue;
        var v = o[k]
        if (isArray(v)) {
          for (i = 0; i < v.length; i++) push(k, v[i])
        } else push(k, o[k])
      }
    }

    // spaces should be + according to spec
    return qs.replace(/&$/, '').replace(/%20/g,'+')
  }

  reqwest.noConflict = function () {
    context.reqwest = old
    return this
  }

  return reqwest
})