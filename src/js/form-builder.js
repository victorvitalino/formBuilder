(function($) {
  'use strict';
  var FormBuilder = function(element, options) {
    // var ZeroClipboard = window.ZeroClipboard;
    var ZeroClipboard = function() {
      return false;
    };

    var defaults = {
      // Uneditable fields or other content you would like to
      // appear before and after regular fields.
      disableFields: {
        // before: '<h2>Header</h2>',
        // after: '<h3>Footer</h3>'
      },
      // array of objects with fields values
      // ex:
      // defaultFields: [{
      //   label: 'First Name',
      //   name: 'first-name',
      //   required: 'true',
      //   description: 'Your first name',
      //   type: 'text'
      // }, {
      //   label: 'Phone',
      //   name: 'phone',
      //   description: 'How can we reach you?',
      //   type: 'text'
      // }],
      defaultFields: [],
      roles: [{
        value: 1,
        label: 'Administrator'
      }],
      showWarning: false,
      serializePrefix: 'frmb',
      labels: {
        add: 'Add Item',
        allowSelect: 'Allow Select',
        autocomplete: 'Autocomplete',
        cannotBeEmpty: 'This field cannot be empty',
        checkboxGroup: 'Checkbox Group',
        checkbox: 'Checkbox',
        checkboxes: 'Checkboxes',
        class: 'Class',
        clearAllMessage: 'Are you sure you want to remove all items?',
        clearAll: 'Clear All',
        close: 'Close',
        copy: 'Copy To Clipboard',
        date: 'Date Field',
        description: 'Help Text',
        descriptionField: 'Description',
        devMode: 'Developer Mode',
        disableFields: 'These fields cannot be moved.',
        editNames: 'Edit Names',
        editorTitle: 'Form Elements',
        editXML: 'Edit XML',
        fieldVars: 'Field Variables',
        fieldRemoveWarning: 'Are you sure you want to remove this field?',
        getStarted: 'Drag a field from the right to this area',
        hide: 'Edit',
        label: 'Label',
        labelEmpty: 'Field Label cannot be empty',
        limitRole: 'Limit access to one or more of the following roles:',
        mandatory: 'Mandatory',
        maxLength: 'Max Length',
        minOptionMessage: 'This field requires a minimum of 2 options',
        name: 'Name',
        no: 'No',
        off: 'Off',
        on: 'On',
        optional: 'optional',
        optionLabelPlaceholder: 'Label',
        optionValuePlaceholder: 'Value',
        optionEmpty: 'Option value required',
        paragraph: 'Paragraph',
        preview: 'Preview',
        radioGroup: 'Radio Group',
        radio: 'Radio',
        removeMessage: 'Remove Element',
        remove: '&#215;',
        required: 'Required',
        richText: 'Rich Text Editor',
        roles: 'Limit Access',
        save: 'Save Template',
        selectOptions: 'Select Items',
        select: 'Select',
        selectionsMessage: 'Allow Multiple Selections',
        text: 'Text Field',
        warning: 'Warning!',
        viewVars: 'View Field Variables',
        viewXML: 'View XML',
        yes: 'Yes'
      }
    };

    var startIndex,
      doCancel,
      _helpers = {};


    _helpers.uniqueArray = (arrArg) => {
      return arrArg.filter((elem, pos, arr) => {
        return arr.indexOf(elem) == pos;
      });
    };

    /**
     * Callback for when a drag begins
     * @param  {object} event
     * @param  {object} ui
     */
    _helpers.startMoving = function(event, ui) {
      event = event;
      ui.item.addClass('moving');
      startIndex = $('li', this).index(ui.item);
    };

    /**
     * Callback for when a drag ends
     * @param  {object} event
     * @param  {object} ui
     */
    _helpers.stopMoving = function(event, ui) {
      event = event;
      ui.item.removeClass('moving');
      if (doCancel) {
        $(ui.sender).sortable('cancel');
        $(this).sortable('cancel');
      }
    };

    /**
     * Make strings safe to be used as classes
     * @param  {string} str string to be converted
     * @return {string}     converter string
     */
    _helpers.safename = function(str) {
      return str.replace(/\s/g, '-').replace(/[^a-zA-Z0-9\-]/g, '').toLowerCase();
    };


    /**
     * Strips non-numbers from a number only input
     * @param  {string} str string with possible number
     * @return {string}     string without numbers
     */
    _helpers.forceNumber = function(str) {
      return str.replace(/[^0-9]/g, '');
    };

    /**
     * [initTooltip description]
     * @param  {[type]} tt [description]
     * @return {[type]}    [description]
     */
    _helpers.initTooltip = function(tt) {
      var tooltip = tt.find('.tooltip');
      tt.mouseenter(function() {
        if (tooltip.outerWidth() > 200) {
          tooltip.addClass('max-width');
        }
        tooltip.css('left', tt.width() + 14);
        tooltip.stop(true, true).fadeIn('fast');
      }).mouseleave(function() {
        tt.find('.tooltip').stop(true, true).fadeOut('fast');
      });
      tooltip.hide();
    };

    // saves the field data to our canvas (elem)
    _helpers.save = function() {
      $sortableFields.children('li').not('.disabled').each(function() {
        _helpers.updatePreview($(this));
      });
      elem.val($sortableFields.toXML());
    };

    // updatePreview will generate the preview for radio and checkbox groups
    _helpers.updatePreview = function(field) {
      var preview;


      // $('.sortable-options li', field).each(function() {
      //   var option = $('.select-option', $(this))[0].outerHTML;
      //   var label = $('.option-label', $(this)).val();
      //   preview += option + ' ' + label + '<br/>';
      // });
      $('.prev-holder', field).html(preview);
    };


    _helpers.nameAttr = function(type) {
      var epoch = new Date().getTime();
      return type + '-' + epoch;
    };


    // update preview to label
    _helpers.updateMultipleSelect = function() {
      $sortableFields.on('change', 'input[name="multiple"]', function() {
        var options = $(this).parents('.fields:eq(0)').find('.sortable-options input.select-option');
        if (this.checked) {
          options.each(function() {
            $(this).prop('type', 'checkbox');
          });
        } else {
          options.each(function() {
            $(this).removeAttr('checked').prop('type', 'radio');
          });
        }
      });
    };

    _helpers.htmlEncode = function(value) {
      return $('<div/>').text(value).html();
    };

    _helpers.htmlDecode = function(value) {
      return $('<div/>').html(value).text();
    };

    _helpers.validateForm = function() {
      var errors = [];
      // check for empty field labels
      $('input[name="label"], input[type="text"].option', $sortableFields).each(function() {
        if ($(this).val() === '') {
          var field = $(this).parents('li.form-field'),
            fieldAttr = $(this);
          errors.push({
            field: field,
            error: opts.labels.labelEmpty,
            attribute: fieldAttr
          });
        }
      });

      // @todo add error = { noVal: opts.labels.labelEmpty }
      if (errors.length) {
        alert('Error: ' + errors[0].error);
        $('html, body').animate({
          scrollTop: errors[0].field.offset().top
        }, 1000, function() {
          var targetID = $('.toggle-form', errors[0].field).attr('id');
          $('.toggle-form', errors[0].field).addClass('open').parent().next('.prev-holder').slideUp(250);
          $('#' + targetID + '-fld').slideDown(250, function() {
            errors[0].attribute.addClass('error');
          });
        });
      }
    };

    _helpers.disabledTT = function(field) {
      var title = field.attr('data-tooltip');
      if (title) {
        field.removeAttr('title').data('tip_text', title);
        var tt = $('<p/>', {
          'class': 'frmb-tt'
        }).html(title);
        field.append(tt);
        tt.css({
          top: -tt.outerHeight(),
          left: -15
        });
        field.mouseleave(function() {
          $(this).attr('data-tooltip', field.data('tip_text'));
          $('.frmb-tt').remove();
        });
      }
    };

    /**
     * Convert hyphenated strings to camelCase
     * @return {string}
     */
    String.prototype.toCamelCase = function() {
      return this.replace(/(\-\w)/g, function(matches) {
        return matches[1].toUpperCase();
      });
    };

    /**
     * Generate markup wrapper where needed
     * @param  {string} type
     * @param  {Object} attrs
     * @param  {String} content we wrap this
     * @return {string}
     */
    _helpers.markup = function(type, attrs = {}, content = '') {
      attrs = attrString(attrs);
      content = Array.isArray(content) ? content.join('') : content;
      let inlineElems = ['input'],
        template = inlineElems.indexOf(type) === -1 ? `<${type} ${attrs}>${content}</${type}>` : `<${type} ${attrs}/>`;
      return template;
    };



    var prepProperties = function(fieldData) {

      var properties = Object.assign({}, {
          label: fieldData.label
        }, fieldData.attrs, fieldData.meta),
        defaultOrder = ['required', 'label', 'description', 'class', 'roles', 'name'],
        order;

      properties.name = properties.name || _helpers.nameAttr(properties.type);

      // if field type is not checkbox, checkbox/radio group or select list, add max length
      if ($.inArray(properties.type, ['checkbox', 'select', 'checkbox-group', 'date', 'autocomplete']) === -1 && !properties.maxLength) {
        properties.maxLength = '';
        defaultOrder.push('maxLength');
      }

      var availableRoles = properties.roles.map(function(elem) {
        elem.type = 'checkbox';
        return elem;
      });

      properties.roles = {
        options: availableRoles,
        value: 1,
        type: 'checkbox'
      };

      delete properties.type;

      order = _helpers.uniqueArray(defaultOrder.concat(Object.keys(properties)));

      var sortedProperties = order.map(function(property) {
        if (properties.hasOwnProperty(property)) {
          return properties[property];
        }
      });

      for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          obj[prop];
        }
      }

      var sortedProperties = {};

      for


      return sortedProperties;
    };


    var opts = $.extend(defaults, options),
      elem = $(element),
      frmbID = 'frmb-' + $('ul[id^=frmb-]').length++;

    var field = '',
      lastID = 1,
      boxID = frmbID + '-control-box';

    var fieldTypes = [
      'text',
      'autocomplete',
      'select',
      'rich-text',
      'date',
      'radio-group',
      'checkbox',
      'checkbox-group'
    ];

    // Create draggable fields for formBuilder
    var cbUL = $('<ul/>', {
      id: boxID,
      'class': 'frmb-control'
    });

    // Setup the input fields
    var frmbFields = fieldTypes.map(function(elem, index) {

      // be sure element is converted to camelCase to get label
      let fieldLabel = elem.toCamelCase(),
        fieldData = {
          label: opts.labels[fieldLabel],
          meta: {
            description: '',
            roles: opts.roles
          },
          attrs: {
            type: elem,
            class: elem + '-input',
            required: {
              value: 1,
              type: 'checkbox'
            }
          }
        };

      fieldData.properties = prepProperties(fieldData);

      console.log(fieldData.properties);

      if ($.inArray(elem, ['select', 'checkbox-group', 'radio-group']) !== -1) {
        fieldData.options = [{
          label: 'Option 1',
          value: 'option-1'
        }, {
          label: 'Option 2',
          value: 'option-2'
        }];
      }

      Object.observe(fieldData, function(changes) {
        // console.log(changes);
        changes.forEach(function(change) {
          //   // Any time name or title change, update the greeting
          //   if (change.name === 'name' || change.name === 'title') {
          //     updateGreeting();
          //   }
        });
      });

      return $('<li/>', fieldData.attrs).data('fieldData', fieldData).html(fieldData.label).removeAttr('type');
    });

    cbUL.append(frmbFields);

    // Build our headers and action links
    var cbHeader = $('<h4/>').html(opts.labels.editorTitle),
      frmbHeader = $('<h4/>').html(opts.labels.preview),
      viewXML = $('<a/>', {
        id: frmbID + '-export-xml',
        text: opts.labels.viewXML,
        'class': 'view-xml'
      }),
      allowSelect = $('<a/>', {
        id: frmbID + '-allow-select',
        text: opts.labels.allowSelect,
        'class': 'allow-select'
      }).prop('checked', 'checked'),
      editXML = $('<a/>', {
        id: frmbID + '-edit-xml',
        text: opts.labels.editXML,
        'class': 'edit-xml'
      }),
      editNames = $('<a/>', {
        id: frmbID + '-edit-names',
        text: opts.labels.editNames,
        'class': 'edit-names'
      }),
      clearAll = $('<a/>', {
        id: frmbID + '-clear-all',
        text: opts.labels.clearAll,
        'class': 'clear-all'
      }),
      saveAll = $('<div/>', {
        id: frmbID + '-save',
        'class': 'save-btn-wrap',
        title: opts.labels.save
      }).html('<a class="save fb-button primary"><span>' + opts.labels.save + '</span></a>'),
      viewVars = $('<a/>', {
        id: frmbID + '-view-vars',
        'class': 'view-vars',
        title: opts.labels.viewVars
      }).html(opts.labels.viewVars),
      actionLinksInner = $('<div/>', {
        id: frmbID + '-action-links-inner',
        'class': 'action-links-inner'
      }).append(editXML, ' | ', viewVars, ' | ', editNames, ' | ', allowSelect, ' | ', clearAll, ' |&nbsp;'),
      devMode = $('<span/>', {
        'class': 'dev-mode-link'
      }).html(opts.labels.devMode + ' ' + opts.labels.off),
      actionLinks = $('<div/>', {
        id: frmbID + '-action-links',
        'class': 'action-links'
      }).append(actionLinksInner, devMode);

    // Sortable fields
    var $sortableFields = $('<ul/>').attr('id', frmbID).addClass('frmb').sortable({
      cursor: 'move',
      opacity: 0.9,
      beforeStop: function(event, ui) {
        var lastIndex = $('> li', $sortableFields).length - 1,
          curIndex = ui.placeholder.index();
        doCancel = ((curIndex <= 1) || (curIndex === lastIndex));
      },
      start: _helpers.startMoving,
      stop: _helpers.stopMoving,
      cancel: 'input, .disabled, .sortable-options, .add, .btn, .no-drag',
      placeholder: 'frmb-placeholder'
    });

    // ControlBox with different fields
    cbUL.sortable({
      helper: 'clone',
      opacity: 0.9,
      connectWith: $sortableFields,
      cursor: 'move',
      placeholder: 'ui-state-highlight',
      start: _helpers.startMoving,
      stop: _helpers.stopMoving,
      revert: 150,
      change: function(event, ui) {
        //fix the logic on this to only hide placeholder for disabledFields.before and after
        // if (ui.placeholder.index() === 0 || ui.placeholder.index() === $('> li', $sortableFields).last().index()) {
        //   $(ui.placeholder).hide();
        // } else {
        //   $(ui.placeholder).show();
        // }
      },
      remove: function(event, ui) {
        if (startIndex === 0) {
          cbUL.prepend(ui.item);
        } else {
          $('li:eq(' + (startIndex - 1) + ')', cbUL).after(ui.item);
        }
      },
      // beforeStop: function(event, ui) {
      //   var lastIndex = $('> li', $sortableFields).length - 1,
      //     curIndex = ui.placeholder.index();
      //   doCancel = ((curIndex <= 1) || (curIndex === lastIndex) ? true : false);
      //   if (ui.placeholder.parent().hasClass('frmb-control')) {
      //     doCancel = true;
      //   }
      // },
      update: function(event, ui) {
        // _helpers.stopMoving;
        elem.stopIndex = ($('li', $sortableFields).index(ui.item) === 0 ? '0' : $('li', $sortableFields).index(ui.item));
        if ($('li', $sortableFields).index(ui.item) < 0) {
          $(this).sortable('cancel');
        } else {
          prepFieldVars(ui.item, true);
        }
      },
      receive: function(event, ui) {
        if (ui.sender.hasClass('frmb') || ui.sender.hasClass('frmb-control')) {
          $(ui.sender).sortable('cancel');
        }
      }
    });

    // Replace the textarea with sortable list.
    elem.before($sortableFields).parent().prepend(frmbHeader).addClass('frmb-wrap').append(actionLinks, viewXML, saveAll);

    var cbWrap = $('<div/>', {
      id: frmbID + '-cb-wrap',
      'class': 'cb-wrap'
    }).append(cbHeader, cbUL);

    var $formWrap = $('.frmb-wrap').before(cbWrap).append(actionLinks);

    var doSave = function() {
      if ($(this).parents('li.disabled').length === 0) {
        if ($(this).name === 'label' && $(this).val() === '') {
          return alert('Error: ' + opts.labels.labelEmpty);
        }
        _helpers.save();
      }
    };

    // Not pretty but we need to save a lot so users don't have to keep clicking a save button
    $('input, select', $sortableFields).on('change', doSave);
    $('input, select', $sortableFields).on('blur', doSave);

    // Parse saved XML template data
    elem.getTemplate = function() {
      var xml = (elem.val() !== '' ? $.parseXML(elem.val()) : false),
        fields = $(xml).find('field');
      if (fields.length > 0) {
        fields.each(function() {
          prepFieldVars($(this));
        });
      } else if (!xml) {
        // Load default fields if none are set
        if (opts.defaultFields.length) {
          for (var i = opts.defaultFields.length - 1; i >= 0; i--) {
            appendNewField(opts.defaultFields[i]);
          }
        } else {
          $formWrap.addClass('empty').attr('data-content', opts.labels.getStarted);
        }
        disabledBeforeAfter();
      }
    };

    var disabledBeforeAfter = function() {
      var li = '<li class="disabled __POSITION__">__CONTENT__</li>';
      if (opts.disableFields.before && !$('.disabled.before', $sortableFields).length) {
        $sortableFields.prepend(li.replace('__POSITION__', 'before').replace('__CONTENT__', opts.disableFields.before));
      }
      if (opts.disableFields.after && !$('.disabled.after', $sortableFields).length) {
        $sortableFields.append(li.replace('__POSITION__', 'after').replace('__CONTENT__', opts.disableFields.after));
      }
    };

    var prepFieldVars = function($field) {
      var fieldData = $field.data('fieldData');

      appendField(fieldData);
      $formWrap.removeClass('empty');
      disabledBeforeAfter();
    };

    // add select dropdown
    var appendSelectList = function(values) {

      if (!values.values || !values.values.length) {
        values.values = [{
          selected: 'false',
          value: {
            label: 'Option 1',
            value: 'option-1'
          }
        }, {
          selected: 'false',
          value: {
            label: 'Option 2',
            value: 'option-2'
          }
        }];
      }

      var field = '',
        name = _helpers.safename(values.name),
        multiDisplay = (values.type === 'checkbox-group') ? 'none' : 'none';

      field += fieldProperties(values);
      field += '<div class="false-label">' + opts.labels.selectOptions + '</div>';
      field += '<div class="fields">';

      field += '<div class="allow-multi" style="display:' + multiDisplay + '">';
      field += '<input type="checkbox" id="multiple_' + lastID + '" name="multiple"' + (values.multiple ? 'checked="checked"' : '') + '>';
      field += '<label class="multiple" for="multiple_' + lastID + '">' + opts.labels.selectionsMessage + '</label>';
      field += '</div>';
      field += '<ol class="sortable-options">';
      for (i = 0; i < values.values.length; i++) {
        field += selectFieldOptions(values.values[i].value, name, values.values[i].selected, values.multiple);
      }
      field += '</ol>';
      field += '<div class="field_actions"><a href="#" class="add add-option"><strong>' + opts.labels.add + '</strong></a> | <a href="#" class="close_field">' + opts.labels.close + '</a></div>';
      field += '</div>';
      appendFieldLi(opts.labels.select, field, values);

      $('.sortable-options').sortable({
        // stop: function (event, ui) {
        //   if ($.browser.msie && parseInt($.browser.version, 10) < 9) {
        //     $("li a.btn.remove", $(this)).css("display", "inline-block");
        //     $("li:eq(0) .remove, li:eq(1) .remove", $(this)).css("display", "none");
        //   }
        // }
      }); // making the dynamically added option fields sortable.
    };

    var appendField = function(fieldData) {
      var li = '',
        delBtn = _helpers.markup('a', {
          class: 'del-button btn',
          title: opts.labels.removeMessage,
          id: 'del_' + lastID
        }, opts.labels.remove),
        toggleBtn = _helpers.markup('a', {
          id: 'frm-' + lastID,
          class: 'toggle-form btn icon-pencil',
          title: opts.labels.hide
        }),
        label = _helpers.markup('span', {
          class: 'field-label'
        }, fieldData.label),
        required = _helpers.markup('span', {
          class: 'required-asterisk'
        }, '*'),
        tooltip = (fieldData.description ? _helpers.markup('span', {
          class: 'tooltip-element',
          tooltip: fieldData.description
        }, '?') : ''),
        legend = _helpers.markup('div', {
          class: 'legend'
        }, [delBtn, label, tooltip, required, toggleBtn]);


      var liContent = _helpers.markup('div', {
        id: 'frm-' + lastID + '-fld',
        class: 'field-properties'
      }, fieldProperties(fieldData.properties));

      li = _helpers.markup('li', {
        id: 'frm-' + lastID + '-item',
        class: fieldData.attrs.type + ' form-field'
      }, [legend, fieldPreview(fieldData), liContent]);

      if (elem.stopIndex) {
        $('li', $sortableFields).eq(elem.stopIndex).after(li);
      } else {
        $sortableFields.append(li);
      }

      $(document.getElementById('frm-' + lastID + '-item')).hide().slideDown(250);

      lastID++;
      _helpers.save();
    };

    /**
     * Takes and object of attributes and converts them to string
     * @param  {object} attrs
     * @return {string}
     */
    var attrString = function(attrs) {
      var attributes = [];
      for (var attr in attrs) {
        if (attrs.hasOwnProperty(attr)) {
          attributes.push(attr + '="' + attrs[attr] + '"');
        }
      }
      return attributes.join(' ');
    };

    /**
     * Build the editable properties for the field
     * @param  {object} fieldData configuration object for field
     * @return {string}        markup for advanced fields
     */
    var fieldProperties = function(properties) {
      console.log(properties);
      var fieldProperties = properties.map(function(property) {
        let field = _helpers.markup('div', {
          'class': `field-property ${property}-wrap`
        }, fieldSetting(property, properties[property]));
        return field;
      });

      return fieldProperties;
    };

    var fieldSetting = function(property, value, type = 'text', label = '') {
      var propertyId = (property + '-' + lastID).replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(),
        setting = [],
        options = [],
        fields = [];

      if (value.options) {
        fields = fieldSetting(property, value.options);
      }

      label = value.label || label || opts.labels[property.toCamelCase()] || property.toUpperCase();
      type = value.type || type;
      value = value.value || value;

      if ($.isArray(value)) {
        options = value.map(function(val, index) {
          return fieldSetting(property + index, val, type, label);
        });
        setting.push(_helpers.markup('div', {
          'class': 'property-options'
        }, options));
        // } else if (typeof value === 'object' && !value.fields) {
        // console.log(value.fields);
        //   for (var prop in value.fields) {
        //     if (value.fields.hasOwnProperty(prop)) {
        //       fieldSetting(prop, value.fields[prop], type, label);
        //     }
        //   }
      } else {
        setting.push(_helpers.markup('input', {
          type: type,
          name: propertyId,
          value: value,
          id: propertyId,
          'class': 'edit-' + property
        }));

        setting.push(_helpers.markup('label', {
          'for': propertyId
        }, label));
      }

      setting.push(setting, fields);

      return setting.join('');
    };

    /**
     * Generate preview markup
     * @param  {object} attrs
     * @return {string}       preview markup for field
     */
    var fieldPreview = function(fieldData) {

      var field = {};

      field.text = function(fieldData) {
        let fieldAttrs = attrString(fieldData.attrs),
          field = `<input ${fieldAttrs}>`,
          value = fieldData.attrs.value || '',
          textArea = `<textarea ${fieldAttrs}>${value}</textarea>`,
          fieldLabel = `<label for="${fieldData.attrs.id}">${fieldData.label}</label>`,
          templates = {};

        templates.text = fieldLabel + field;
        templates.password = templates.text;
        templates.autocomplete = templates.text;
        templates.date = templates.text;
        templates.checkbox = field + fieldLabel;
        templates.radio = templates.checkbox;
        templates.textArea = fieldLabel + textArea;

        return templates[fieldData.attrs.type];
      };


      field.password = Object.assign(field.text);
      field.email = field.text;
      field.date = field.text;
      field.checkbox = field.text;
      field.autocomplete = field.text;

      field.select = function(fieldData) {
        console.log(fieldData);
        let options,
          attrs = fieldData.attrs,
          i;
        for (i = fieldData.options - 1; i >= 0; i--) {
          console.log(fieldData.options[i]);
          options += `<option value="${fieldData.options[i].value}">${fieldData.options[i].label}</option>`;
        }
        return `<${attrs.type}>${options}</${attrs.type}>`;
      };


      return `<div class="prev-holder">${field[fieldData.attrs.type](fieldData)}</div>`;
    };

    // Select field html, since there may be multiple
    var selectFieldOptions = function(values, name, selected, multiple) {
      var selectedType = (multiple ? 'checkbox' : 'radio');

      if (typeof values !== 'object') {
        values = {
          label: '',
          value: ''
        };
      } else {
        values.label = values.hasOwnProperty('label') ? values.label : '';
        values.value = values.hasOwnProperty('value') ? values.value : '';
      }

      field = '<li>';
      field += '<input type="' + selectedType + '" ' + selected + ' class="select-option" name="' + name + '" />';
      field += '<input type="text" class="option-label" placeholder="' + opts.labels.optionLabelPlaceholder + '" value="' + values.label + '" />';
      field += '<input type="text" class="option-value" placeholder="' + opts.labels.optionValuePlaceholder + '" value="' + values.value + '" />';
      field += '<a href="#" class="remove btn" title="' + opts.labels.removeMessage + '">' + opts.labels.remove + '</a>';
      field += '</li>';

      return field;
    };

    // ---------------------- UTILITIES ---------------------- //

    // delete options
    $sortableFields.on('click', '.remove', function(e) {
      e.preventDefault();
      var optionsCount = $(this).parents('.sortable-options:eq(0)').children('li').length;
      if (optionsCount <= 2) {
        alert('Error: ' + opts.labels.minOptionMessage);
      } else {
        $(this).parent('li').slideUp('250', function() {
          $(this).remove();
        });
      }
    });

    // toggle fields
    $sortableFields.on('click', '.toggle-form', function(e) {
      e.preventDefault();
      var targetID = $(this).attr('id');
      $(this).toggleClass('open').parent().next('.prev-holder').slideToggle(250);
      $(document.getElementById(targetID + '-fld')).slideToggle(250, function() {
        // do something after attr toggle
      });
    });

    // update preview to label
    $sortableFields.on('keyup', '.edit-label', function(e) {
      $('.field-label', $(this).closest('li')).html($(this).val());
    });

    // remove error styling when users tries to correct mistake
    $sortableFields.on('keyup', 'input.error', function() {
      $(this).removeClass('error');
    });

    $sortableFields.on('keyup', '.edit-description', function(e) {
      e.preventDefault();
      var closestToolTip = $('.tooltip-element', $(this).closest('li'));
      if ($(this).val() !== '') {
        if (!closestToolTip.length) {
          var tt = '<span class="tooltip-element" tooltip="' + $(this).val() + '">?</span>';
          $('.toggle-form', $(this).closest('li')).before(tt);
          // _helpers.initTooltip(tt);
        } else {
          closestToolTip.attr('tooltip', $(this).val()).css('display', 'inline-block');
        }
      } else {
        if (closestToolTip.length) {
          closestToolTip.css('display', 'none');
        }
      }
    });

    _helpers.updateMultipleSelect();

    // format name attribute
    $sortableFields.on('keyup', '.edit-name', function() {
      $(this).val(_helpers.safename($(this).val()));
      if ($(this).val() === '') {
        $(this).addClass('field_error').attr('placeholder', opts.labels.cannotBeEmpty);
      } else {
        $(this).removeClass('field_error');
      }
    });

    $sortableFields.on('keyup', 'input.fld-max-length', function() {
      $(this).val(_helpers.forceNumber($(this).val()));
    });

    // Delete field
    $sortableFields.on('click', '.del-button', function(e) {
      e.preventDefault();

      // lets see if the user really wants to remove this field... FOREVER
      var fieldWarnH3 = $('<h3/>').html('<span></span>' + opts.labels.warning),
        deleteID = $(this).attr('id').replace(/del_/, ''),
        delBtn = $(this),
        $field = $(document.getElementById('frm-' + deleteID + '-item')),
        toolTipPageX = delBtn.offset().left - $(window).scrollLeft(),
        toolTipPageY = delBtn.offset().top - $(window).scrollTop();

      if (opts.showWarning) {
        jQuery('<div />').append(fieldWarnH3, opts.labels.fieldRemoveWarning).dialog({
          modal: true,
          resizable: false,
          width: 300,
          dialogClass: 'ite-warning',
          open: function() {
            $('.ui-widget-overlay').css({
              'opacity': 0.0
            });
          },
          position: [toolTipPageX - 282, toolTipPageY - 178],
          buttons: [{
            text: opts.labels.yes,
            click: function() {
              $field.slideUp(250, function() {
                $(this).remove();
                _helpers.save();
              });
              $(this).dialog('close');
            }
          }, {
            text: opts.labels.no,
            'class': 'cancel',
            click: function() {
              $(this).dialog('close');
            }
          }]
        });
      } else {
        $field.slideUp(250, function() {
          $(this).remove();
          _helpers.save();
        });
      }
    });

    // Attach a callback to toggle required asterisk
    $sortableFields.on('click', '.edit-required', function() {
      var requiredAsterisk = $(this).parents('li.form-field').find('.required-asterisk');
      requiredAsterisk.toggle();
    });

    // Attach a callback to toggle roles visibility
    $sortableFields.on('click', '.edit-roles', function() {
      var roles = $(this).siblings('.property-options'),
        enableRolesCB = $(this);
      roles.slideToggle(250, function() {
        if (!enableRolesCB.is(':checked')) {
          $('input[type="checkbox"]', roles).removeAttr('checked');
        }
      });
    });

    // Attach a callback to add new checkboxes
    $sortableFields.on('click', '.add-checkbox', function() {
      $(this).parent().before(selectFieldOptions());
      return false;
    });

    $sortableFields.on('mouseenter', 'li.disabled .form-element', function() {
      _helpers.disabledTT($(this));
    });

    // Attach a callback to add new options
    $sortableFields.on('click', '.add-option', function(e) {
      e.preventDefault();
      var isMultiple = $(this).parents('.fields').first().find('input[name="multiple"]')[0].checked,
        name = $(this).parents('.fields').find('.select-option:eq(0)').attr('name');
      $(this).parents('.fields').first().find('.sortable-options').append(selectFieldOptions(false, name, false, isMultiple));
      _helpers.updateMultipleSelect();
    });

    // Attach a callback to close link
    $sortableFields.on('click', '.close_field', function(e) {
      e.preventDefault();
      $(this).parents('li.form-field').find('.toggle-form').trigger('click');
    });

    // Attach a callback to add new radio fields
    $sortableFields.delegate('click', '.add_rd', function(e) {
      e.preventDefault();
      $(this).parent().before(selectFieldOptions(false, $(this).parents('.field-properties').attr('id')));
    });

    $('.field-properties .fields .remove, .frmb .del-button').on('hover', function() {
      $(this).parents('li.form-field').toggleClass('delete');
    });

    // View XML
    $(document.getElementById(frmbID + '-export-xml')).click(function(e) {
      e.preventDefault();
      var xml = elem.val(),
        $pre = $('<pre />').text(xml);
      $pre.dialog({
        resizable: false,
        modal: true,
        width: 720,
        dialogClass: 'frmb-xml',
        overlay: {
          color: '#333333'
        }
      });
    });

    // View Field Vars
    $(document.getElementById(frmbID + '-view-vars')).click(function(e) {
      e.preventDefault();
      var fieldVars = '<table width="100%">';
      fieldVars += '<tr><td width="50%" height="30"><strong>' + opts.labels.fieldVars + '</strong></td><td align="center"><strong>' + opts.labels.copy + '</strong></td></tr>';
      $sortableFields.children('li').not('.disabled').each(function() {
        fieldVars += '<tr><td>$__' + $('input[name="name"]', $(this)).val() + '__</td><td align="center"><span id=' + $('input[name="name"]', $(this)).val() + '_' + Math.random().toString(36).substr(2, 6) + '_var" class="copy-var clipboard" data-clipboard-text="$__' + $('input[name="name"]', $(this)).val() + '__"></span></td></tr>';
      });
      fieldVars += '</table>';

      $('<div />').html(fieldVars).dialog({
        modal: true,
        width: 400,
        dialogClass: 'spigit-field-vars',
        overlay: {
          color: '#333333'
        },
        open: function() {
          $('.copy-var').each(function() {
            var thisID = $(this).attr('id');
            var clip = new ZeroClipboard(document.getElementById(thisID));
            clip.on('load', function(client) {
              client.on('complete', function() {
                $('.copy-var').removeClass('copied');
                $(this).addClass('copied');
              });
            });
          });
        }
      });
    });

    // Clear all fields in form editor
    $(document.getElementById(frmbID + '-clear-all')).click(function(e) {
      e.preventDefault();
      if (window.confirm(opts.labels.clearAllMessage)) {
        $sortableFields.empty();
        elem.val('');
        _helpers.save();
        var values = {
          label: [opts.labels.descriptionField],
          name: ['content'],
          required: 'true',
          description: opts.labels.mandatory
        };

        appendNewField(values);
        $sortableFields.prepend(opts.disableFields.before);
        $sortableFields.append(opts.disableFields.after);
      }
    });

    // Save Idea Template
    $(document.getElementById(frmbID + '-save')).click(function(e) {
      e.preventDefault();
      if (!$formWrap.hasClass('edit-xml')) {
        _helpers.save();
      }
      _helpers.validateForm(e);
    });


    var triggerDevMode = false,
      keys = [],
      devCode = '68,69,86';
    // Super secret Developer Tools
    $('.save.fb-button').mouseover(function() {
      triggerDevMode = true;
    }).mouseout(function() {
      triggerDevMode = false;
    });
    $(document.documentElement).keydown(function(e) {
      keys.push(e.keyCode);
      if (keys.toString().indexOf(devCode) >= 0) {
        $('.action-links').toggle();
        $('.view-xml').toggle();
        keys = [];
      }
    });
    // Toggle Developer Mode
    $('.dev-mode-link').click(function(e) {
      e.preventDefault();
      var dml = $(this);
      $formWrap.toggleClass('dev-mode');
      dml.parent().css('opacity', 1);
      if ($formWrap.hasClass('dev-mode')) {
        dml.siblings('.action-links-inner').css('width', '100%');
        dml.html(opts.labels.devMode + ' ' + opts.labels.on).css('color', '#8CC63F');
      } else {
        dml.siblings('.action-links-inner').css('width', 0);
        dml.html(opts.labels.devMode + ' ' + opts.labels.off).css('color', '#666666');
        triggerDevMode = false;
        $('.action-links').toggle();
        $('.view-xml').toggle();
      }
    });

    // Toggle Edit Names
    $(document.getElementById(frmbID + '-edit-names')).click(function(e) {
      e.preventDefault();
      $(this).toggleClass('active');
      $('.name_wrap', $sortableFields).slideToggle(250, function() {
        $formWrap.toggleClass('edit-names');
      });
    });

    // Toggle Allow Select
    $(document.getElementById(frmbID + '-allow-select')).click(function(e) {
      e.preventDefault();
      $(this).toggleClass('active');
      $('.allow-multi, .select-option', $sortableFields).slideToggle(250, function() {
        $formWrap.toggleClass('allow-select');
      });
    });

    // Toggle Edit XML
    $(document.getElementById(frmbID + '-edit-xml')).click(function(e) {
      e.preventDefault();
      $(this).toggleClass('active');
      $('textarea.idea-template').show();
      $('.template-textarea-wrap').slideToggle(250);
      $formWrap.toggleClass('edit-xml');
    });

    elem.parent().find('p[id*="ideaTemplate"]').remove();
    elem.wrap('<div class="template-textarea-wrap"/>');
    elem.getTemplate();
  };


  $.fn.formBuilder = function(options) {
    var form = this;
    return form.each(function() {
      var element = $(this);
      if (element.data('formBuilder')) {
        return;
      }
      var formBuilder = new FormBuilder(this, options);
      element.data('formBuilder', formBuilder);
    });
  };
})(jQuery);
