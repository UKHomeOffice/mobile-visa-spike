/*eslint no-undef:1*/
$(function () {
  var GOVUK = window.GOVUK || false;
  new GOVUK.SelectionButtons($('input[type="radio"]'));
  $('input[type="radio"]').on('click',function () {
    $('.form-group').removeClass('error');
    $('.validation-message').hide();
  });
});