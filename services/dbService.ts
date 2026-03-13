
import { supabase } from './supabaseClient';
import { 
  IdentifiedPlant, 
  CropPlan, 
  ProfessionalClient, 
  ProfessionalPrescription, 
  SeasonalRecommendation, 
  ConsumerProduct,
  NutritionPlan,
  UserProfile,
  MarketOffer
} from '../types';

export const dbService = {
  /**
   * Faz upload de uma imagem base64 para o storage e retorna a URL pública.
   */
  async uploadImage(base64: string, fileName: string): Promise<string | null> {
    try {
      // Converte base64 para Blob
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });

      const filePath = `diagnosticos/${Date.now()}_${fileName}.jpg`;
      
      const { data, error } = await supabase.storage
        .from('fotos-lavoura')
        .upload(filePath, blob);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('fotos-lavoura')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error("Erro no upload da imagem:", error);
      return null;
    }
  },

  /**
   * Salva o diagnóstico de uma planta.
   */
  async savePlantDiagnosis(plant: Omit<IdentifiedPlant, 'id'>, userId: string): Promise<IdentifiedPlant | null> {
    try {
      const { data, error } = await supabase
        .from('plants')
        .insert([
          {
            user_id: userId,
            common_name: plant.commonName,
            scientific_name: plant.scientificName,
            date: plant.date,
            image_url: plant.imageUrl,
            health_status: plant.healthStatus,
            diagnosis_summary: plant.diagnosisSummary,
            full_diagnosis: plant.fullDiagnosis,
            confidence: plant.confidence,
            location: plant.location
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Erro ao salvar planta no Supabase:", error);
      return null;
    }
  },

  /**
   * Busca o histórico de plantas identificadas de um usuário específico.
   */
  async getPlantHistory(userId: string): Promise<IdentifiedPlant[]> {
    try {
      const { data, error } = await supabase
        .from('plants')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;

      return data.map((r: any) => ({
        id: r.id.toString(),
        commonName: r.common_name,
        scientificName: r.scientific_name,
        date: new Date(r.date).toLocaleDateString('pt-BR'),
        imageUrl: r.image_url,
        healthStatus: r.health_status,
        diagnosisSummary: r.diagnosis_summary,
        fullDiagnosis: r.full_diagnosis,
        confidence: r.confidence,
        location: r.location
      }));
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
      return [];
    }
  },

  /**
   * Salva um plano de safra.
   */
  async saveCropPlan(plan: CropPlan): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('crop_plans')
        .insert([
          {
            crop_name: plan.cropName,
            data: plan
          }
        ]);
      return !error;
    } catch (error) {
      console.error("Erro ao salvar plano:", error);
      return false;
    }
  },

  /**
   * Busca todos os planos de safra salvos.
   */
  async getCropPlans(): Promise<CropPlan[]> {
    try {
      const { data, error } = await supabase
        .from('crop_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map((r: any) => ({
        ...r.data,
        id: r.id // Optionally include DB ID if needed
      }));
    } catch (error) {
      console.error("Erro ao buscar planos de safra:", error);
      return [];
    }
  },

  // --- PROFESSIONAL HUB METHODS ---

  async getProfessionalClients(professionalId: string): Promise<ProfessionalClient[]> {
    try {
      const { data, error } = await supabase
        .from('professional_clients')
        .select('*')
        .eq('professional_id', professionalId);
      if (error) throw error;
      return data.map(r => ({
        id: r.id,
        name: r.name,
        goal: r.goal,
        lastUpdate: r.last_update,
        status: r.status,
        score: r.score,
        professionalId: r.professional_id
      }));
    } catch (error) {
      console.error("Error fetching professional clients:", error);
      return [];
    }
  },

  async saveProfessionalClient(client: ProfessionalClient): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('professional_clients')
        .insert([{
          id: client.id,
          name: client.name,
          goal: client.goal,
          last_update: client.lastUpdate,
          status: client.status,
          score: client.score,
          professional_id: client.professionalId
        }]);
      return !error;
    } catch (error) {
      console.error("Error saving professional client:", error);
      return false;
    }
  },

  async saveProfessionalPrescription(prescription: Omit<ProfessionalPrescription, 'id' | 'createdAt'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('professional_prescriptions')
        .insert([{
          client_id: prescription.clientId,
          professional_id: prescription.professionalId,
          title: prescription.title,
          description: prescription.description,
          items: prescription.items
        }]);
      return !error;
    } catch (error) {
      console.error("Error saving prescription:", error);
      return false;
    }
  },

  async getSeasonalRecommendations(): Promise<SeasonalRecommendation[]> {
    try {
      const { data, error } = await supabase
        .from('seasonal_recommendations')
        .select('*');
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching seasonal recommendations:", error);
      return [];
    }
  },

  // --- CONSUMER HUB METHODS ---

  async getConsumerProducts(): Promise<ConsumerProduct[]> {
    try {
      const { data, error } = await supabase
        .from('consumer_products')
        .select('*');
      if (error) throw error;
      return data.map(r => ({
        id: r.id,
        name: r.name,
        price: r.price,
        producer: r.producer,
        rating: r.rating,
        category: r.category,
        isOrganic: r.is_organic
      }));
    } catch (error) {
      console.error("Error fetching consumer products:", error);
      return [];
    }
  },

  async saveNutritionPlan(plan: Omit<NutritionPlan, 'id'>, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('nutrition_plans')
        .insert([{
          user_id: userId,
          title: plan.title,
          goal: plan.goal,
          daily_meals: plan.dailyMeals,
          seasonal_focus: plan.seasonalFocus
        }]);
      return !error;
    } catch (error) {
      console.error("Error saving nutrition plan:", error);
      return false;
    }
  },

  async saveUserProfile(profile: Omit<UserProfile, 'createdAt'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert([{
          id: profile.id,
          email: profile.email,
          role: profile.role,
          full_name: profile.fullName,
          document: profile.document,
          phone: profile.phone,
          producer_data: profile.producerData,
          retailer_data: profile.retailerData,
          professional_data: profile.professionalData,
          consumer_data: profile.consumerData
        }]);
      return !error;
    } catch (error) {
      console.error("Error saving user profile:", error);
      return false;
    }
  },

  // --- MARKETPLACE METHODS ---

  async getMarketOffers(): Promise<MarketOffer[]> {
    try {
      const { data, error } = await supabase
        .from('market_offers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(r => ({
        id: r.id,
        producerId: r.producer_id,
        product: r.product,
        quantity: r.quantity,
        unit: r.unit,
        price: r.price,
        location: r.location,
        isOrganic: r.is_organic,
        status: r.status,
        createdAt: r.created_at
      }));
    } catch (error) {
      console.error("Error fetching market offers:", error);
      return [];
    }
  },

  async saveMarketOffer(offer: Omit<MarketOffer, 'id' | 'createdAt'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('market_offers')
        .insert([{
          producer_id: offer.producerId,
          product: offer.product,
          quantity: offer.quantity,
          unit: offer.unit,
          price: offer.price,
          location: offer.location,
          is_organic: offer.isOrganic,
          status: offer.status
        }]);
      return !error;
    } catch (error) {
      console.error("Error saving market offer:", error);
      return false;
    }
  }
};
