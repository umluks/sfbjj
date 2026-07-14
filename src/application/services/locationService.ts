export interface Localizacao {
  nome: string;
  endereco: string;
  detalhes: string;
  cep: string;
  iframeUrl: string;
  mapsUrl: string;
  descricao: string;
}

const DEFAULT_LOCATION: Localizacao = {
  nome: 'Sagrada Família Brasília Jiu-Jitsu',
  endereco: 'SGAS 615, Conjunto D, Lotes 33/34',
  detalhes: 'Paróquia Sagrado Coração de Jesus e Nossa Senhora das Mercês, Asa Sul, Brasília - DF',
  cep: '70200-750',
  iframeUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3839.261295325858!2d-47.90098522525757!3d-15.811802184852928!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x935a3ae455555555%3A0x6281729b48c7c98f!2sPar%C3%B3quia%20Sagrado%20Cora%C3%A7%C3%A3o%20de%20Jesus%20e%20Nossa%20Senhora%20das%20Merc%C3%AAs!5e0!3m2!1spt-BR!2sbr!4v1716739200000!5m2!1spt-BR!2sbr',
  mapsUrl: 'https://maps.app.goo.gl/r6v23X4rC91V712V6',
  descricao: 'Nosso tatame principal fica localizado no subsolo da Paróquia Sagrado Coração de Jesus e Nossa Senhora das Mercês na Asa Sul, Brasília. Um local seguro, com excelente infraestrutura e estacionamento fácil.'
};

export const locationService = {
  getLocation(): Localizacao {
    try {
      const stored = localStorage.getItem('sfbjj_location');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Erro ao obter localização:', e);
    }
    return DEFAULT_LOCATION;
  },

  saveLocation(location: Localizacao): void {
    try {
      localStorage.setItem('sfbjj_location', JSON.stringify(location));
      // Dispara evento customizado para notificar outras partes do app que possam estar abertas
      window.dispatchEvent(new Event('sfbjj_location_changed'));
    } catch (e) {
      console.error('Erro ao salvar localização:', e);
    }
  }
};

export default locationService;
