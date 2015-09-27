
// toXML is a jQuery plugin that turns our form editor into custom XML
(function($) {
  'use strict';
  $.fn.toXML = function(options) {
    var defaults = {
      prepend: '',
      attributes: ['class']
    };
    var opts = $.extend(defaults, options);

    var serialStr = '';

    // Begin the core plugin
    this.each(function() {
      var liCount = 0;
      var c = 1;

      if ($(this).children().length >= 1) {
        serialStr += '<form-template>\n\t<fields>';

        // build new xml
        $(this).children().each(function() {
          var $field = $(this);
          if (!($field.hasClass('moving') || $field.hasClass('disabled'))) {
            for (var att = 0; att < opts.attributes.length; att++) {
              var required = $('input.required', $field).is(':checked') ? 'required="true" ' : 'required="false" ',
                multipleChecked = $('input[name="multiple"]', $field).is(':checked'),
                multiple = multipleChecked ? 'style="multiple" ' : '',
                t = $field.attr(opts.attributes[att]), // field type
                type = 'type="' + t + '" ',
                fName = 'name="' + $('input.fld-name', $field).val() + '" ',
                fLabel = 'label="' + $('input.fld-label', $field).val() + '" ',
                roleVals = $.map($('input.roles-field:checked', $field), function(n) {
                  return n.value;
                }).join(','),
                roles = (roleVals !== '' ? 'role="' + roleVals + '" ' : ''),
                desc = 'description="' + $('input.fld-description', $field).val() + '" ',
                maxLengthVal = $('input.fld-max-length', $field).val(),
                maxLength = 'max-length="' + (maxLengthVal !== undefined ? maxLengthVal : '') + '" ',
                fSlash = (t !== 'select' && t !== 'checkbox-group' ? '/' : '');

              serialStr += '\n\t\t<field ' + fName + fLabel + multiple + roles + desc + (maxLengthVal !== '' ? (maxLengthVal !== undefined ? maxLength : '') : '') + required + type + fSlash + '>';

              if (t === 'select' || t === 'checkbox-group') {
                c = 1;
                $('input[type=text][class=option]', $field).each(function() {
                  if ($(this).attr('name') !== 'title') {
                    var selected = $(this).prev().is(':checked') ? ' selected="true"' : '';
                    serialStr += '\n\t\t\t<option' + selected + '>' + $(this).val() + '</option>';
                  }
                  c++;
                });
                serialStr += '\n\t\t</field>';
              }
            }
          }
          liCount++;
        });
        serialStr += '\n\t</fields>\n</form-template>';
      } // if "$(this).children().length >= 1"

    });
    return (serialStr);
  };
})(jQuery);
