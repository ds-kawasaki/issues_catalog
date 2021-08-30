// jQuery用DOM準備完了時 document ready
$(function () {
  $('#form-bulk-edit-tag-categories button').on('click', function() {
    const selectCategories = $('#select-catalog-tag-categories').val();
    if (!selectCategories.length) { return; }
    // console.log(selectCategories);
    const form = $(this).parents('form');
    let checkIdes = false;
    $('input[name="ids[]"]:checked').each(function() {
      $('<input>').attr({'type':'hidden', 'name':'ids[]'}).val($(this).val()).appendTo(form);
      checkIdes = true;
    });
    if (checkIdes) {
      form.submit();
    }
  });
});