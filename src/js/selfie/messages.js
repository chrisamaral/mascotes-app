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
        choose_pic: 'Choose photo',
        confirm_pic: 'This one',
        capture_pic: 'Take shot',
        new_pic: 'Take another',
        try_again: 'Take another',
        save_pic: 'Save'
      },
      errors: {
        camera: 'Oops... there was an error accessing your camera',
        upload_fb: "Oops... We couldn't upload your Selfie to Facebook :(",
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
        choose_pic: 'Escolher foto',
        confirm_pic: 'Quero essa',
        capture_pic: 'Capturar',
        new_pic: 'Tirar uma nova',
        try_again: 'Tirar outra',
        save_pic: 'Salvar'
      },
      errors: {
        camera: 'Não foi possível capturar imagem',
        upload_fb: 'Não foi possível enviar a foto pro seu facebook :(',
        file: 'Arquivo Inválido, por favor selecione uma imagem.',
        size: 'O arquivo selecionado é muito grande ({size}MB), por favor selecione algum com menos de {max}MB ;)',
        format: 'Formato Inválido. Os formatos aceitos são: {types}'
      }
    }
  }
};