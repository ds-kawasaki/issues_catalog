  //  一括タグカテゴリの「一括追加」「一括削除」ボタン押下時
export const setupBulkFormButton = (buttonQuery, selectQuery) => {
  $(buttonQuery).on('click', function () {
    const selects = $(selectQuery).val();
    if (!selects.length) { return; }
    // console.log(selects);
    const form = $(this).parents('form');
    form.find('[name=ids\\[\\]]').remove();
    let checkIdes = false;
    $('input[name=ids\\[\\]]:checked').each(function () {
      $('<input>').attr({ 'type': 'hidden', 'name': 'ids[]' }).val($(this).val()).appendTo(form);
      checkIdes = true;
    });
    if (checkIdes) {
      form.find('[name=operate]').val($(this).val());
      form.submit();
    }
  });
};
