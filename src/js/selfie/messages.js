module.exports = {
  en: {
    locales: ['en-US'],

    messages: {
      close: 'Exit',
      welcome: {
        paragraph:
          '<p>The mascots are ready to take a cool selfie with you.</p>' +
          '<p>Take a picture and share it with your friends.</p>',
        proceed: "Go for it!"
      },
      menu: {
        change_pic: 'Switch photo',
        change_pic_mob: 'Change',
        choose_pic: 'Choose photo',
        choose_pic_mob: 'Gallery',
        confirm_pic: 'This one',
        confirm_pic_mob: 'Ok',
        capture_pic: 'Take shot',
        capture_pic_mob: 'Take shot',
        new_pic: 'Take another',
        new_pic_mob: 'Camera',
        try_again: 'Take another',
        try_again_mob: 'Try again',
        share: 'Share',
        save_pic: 'Save'
      },
      errors: {
        camera: 'Oops... there was an error accessing your camera',
        upload_fb: "Oops... We couldn't upload your Selfie to Facebook :(",
        write_to_disk: "Sorry, we couldn't save your picture.",
        file: 'Invalid File! Please select your photo.',
        size: 'The selected file is too big ({size}MB), the maximum allowed size is {max}MB ;)',
        format: 'Invalid Format. We only accept photos in these formats: {types}'
      }
    }
  },
  pt: {
    locales: ['pt-BR'],
    messages: {
      close: 'Fechar',
      welcome: {
        paragraph:
        '<p>Os mascotes estão prontos pra tirar uma selfie irada com você.</p>' +
        '<p>Tire a foto e compartilhe <br> com seus amigos.</p>',
        proceed: "Vamos nessa"
      },
      menu: {
        change_pic: 'Trocar foto',
        change_pic_mob: 'Trocar',
        choose_pic: 'Escolher foto',
        choose_pic_mob: 'Galeria',
        confirm_pic: 'Quero essa',
        confirm_pic_mob: 'Ok',
        capture_pic: 'Capturar',
        capture_pic_mob: 'Capturar',
        new_pic: 'Tirar uma nova',
        new_pic_mob: 'Tirar nova',
        try_again: 'Tirar outra',
        try_again_mob: 'Tirar outra',
        share: 'Compartilhar',
        save_pic: 'Salvar'
      },
      errors: {
        camera: 'Não foi possível capturar imagem',
        upload_fb: 'Não foi possível enviar a foto pro seu facebook :(',
        write_to_disk: 'Não foi possível salvar a imagem.',
        file: 'Arquivo Inválido, por favor selecione uma imagem.',
        size: 'O arquivo selecionado é muito grande ({size}MB), por favor selecione algum com menos de {max}MB ;)',
        format: 'Formato Inválido. Os formatos aceitos são: {types}'
      }
    }
  }
};