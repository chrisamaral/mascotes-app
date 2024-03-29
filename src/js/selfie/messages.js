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
        share_on: "Oops... We couldn't send your Selfie to {app_name} :(",
        write_to_disk: "Sorry, we couldn't save your picture.",
        file: 'Invalid File! Please select your photo.',
        size: 'The selected file is too big ({size}MB), the maximum allowed size is {max}MB ;)',
        format: 'Invalid Format. We only accept photos in these formats: {types}'
      },
      share_text: {
        twitter: 'Selfie with the Mascots Rio2016'
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
        camera: 'Ih! Rolou algum probleminha com a sua câmera.',
        share_on: 'Ah! Sua selfie não foi postada no {app_name} :(',
        write_to_disk: 'Puff! Não deu pra salvar sua foto. Pode tentar de novo?',
        file: 'Esse não vale. Pode usar um arquivo de outro formato?',
        size: 'Esse arquivo é grande demais({size}MB), mande um com menos de {max}MB ;)',
        format: 'Ih, falhou. Aqui só dá pra mandar: {types}'
      },
      share_text: {
        twitter: 'Selfie com os Mascotes Rio2016'
      }
    }
  }
};