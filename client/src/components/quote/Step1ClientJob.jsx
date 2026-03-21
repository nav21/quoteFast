import { formatPhone } from '../../utils/formatPhone.js';

const JOB_PLACEHOLDERS = {
  'Plumbing': 'e.g. Kitchen sink leaking under cabinet. Customer wants faucet replaced and pipes checked for corrosion. Standard residential kitchen, about 10 years old.',
  'Electrical': 'e.g. Install 4 recessed lights in living room ceiling and add a dimmer switch. Room is about 15x20 ft, existing wiring in attic above.',
  'Landscaping': 'e.g. Full backyard cleanup — overgrown hedges need trimming, lawn reseeding on ~2,000 sq ft, and install a small flagstone patio area near the deck.',
  'Painting': 'e.g. Repaint 3 bedrooms and hallway, walls and ceilings. Some drywall patching needed. Currently dark colors, going to light neutral tones.',
  'Cleaning': 'e.g. Deep clean 3-bedroom house before new tenants move in. Includes oven, fridge interior, all bathrooms, and window tracks. About 1,800 sq ft.',
  'Roofing': 'e.g. Replace missing shingles on south-facing slope and reseal flashing around chimney. Roof is about 15 years old, single-story ranch home.',
  'HVAC': 'e.g. AC not cooling properly — unit runs but blows warm air. System is about 8 years old, 3-ton unit. Need diagnosis and repair or replacement quote.',
  'General Contracting': 'e.g. Finish basement — frame walls, drywall, flooring, and add a half bathroom. Space is roughly 600 sq ft, no existing plumbing stubbed in.',
  'Handyman': 'e.g. Fix sticking front door, mount 3 TVs on walls, install floating shelves in office, and replace 2 leaky outdoor faucets.',
  'Pest Control': 'e.g. Seeing carpenter ants near the kitchen window and in the basement. Two-story house, wood siding. Need inspection and treatment plan.',
  'Pressure Washing': 'e.g. Pressure wash driveway (2-car, about 400 sq ft), front walkway, and vinyl siding on front of house. Some green algae buildup.',
  'Photography': 'e.g. Family portrait session for 5 people at a local park. Want about 1 hour of shooting time, 20 edited digital images, and 2 print-ready files.',
  'Videography': 'e.g. Film a 2-minute promotional video for a small bakery. Include interior shots, staff at work, and product close-ups. One half-day shoot.',
  'Graphic Design': 'e.g. Design a brand identity package — logo, business card, and letterhead. Modern, clean style for a wellness studio. Need print-ready and web files.',
  'Web Design': 'e.g. Build a 5-page website for a local bakery — home, menu, about, catering inquiry form, and contact. Mobile-friendly, with online ordering link.',
  'Event Planning': 'e.g. Plan and coordinate a 50-person corporate holiday party. Need venue sourcing, catering coordination, decorations, and day-of management.',
  'DJ & Entertainment': 'e.g. DJ for outdoor wedding reception, 150 guests, 5 hours including cocktail hour. Need PA system, wireless mic for toasts, and lighting.',
  'Florist': 'e.g. Wedding flowers for ceremony and reception — bridal bouquet, 4 bridesmaid bouquets, 10 table centerpieces, and altar arrangements. Colors: blush and ivory.',
  'Catering': 'e.g. Lunch catering for 30-person office event. Need appetizers, 2 entrée options (one vegetarian), sides, and dessert. Setup and cleanup included.',
  'Consulting': 'e.g. 10-hour strategy engagement to audit current marketing spend and recommend reallocation. Includes data review, stakeholder interviews, and final report.',
  'Tutoring': 'e.g. SAT prep tutoring for a high school junior — 2 sessions per week for 8 weeks, covering math and reading/writing sections. In-home preferred.',
  'Coaching': 'e.g. 6-session executive coaching package focused on leadership communication and team management. Virtual 1-hour sessions, bi-weekly.',
  'Bookkeeping': 'e.g. Monthly bookkeeping for a small e-commerce business. About 200 transactions/month, bank reconciliation, and quarterly financial reports.',
  'Personal Training': 'e.g. In-home personal training, 3 sessions per week for 4 weeks. Focus on strength training and mobility. Client is a beginner, no equipment at home.',
  'Interior Design': 'e.g. Redesign open-concept living and dining area, about 500 sq ft. Need furniture plan, color palette, and sourcing. Budget around $8k for furnishings.',
  'Auto Detailing': 'e.g. Full interior and exterior detail on a 2019 SUV. Pet hair in back seat, minor paint swirl marks. Include clay bar, polish, and ceramic coating.',
  'Auto Repair': 'e.g. Check engine light on, rough idle when cold. 2017 Honda Civic, about 85k miles. Last oil change was 6 months ago. Need diagnosis and estimate.',
  'Mobile Mechanic': 'e.g. Brake pads and rotors replacement on all four wheels. 2015 Toyota Camry, parked at my home. Also check brake fluid level.',
  'Moving': 'e.g. Local move from 2-bedroom apartment (3rd floor, no elevator) to a house 15 miles away. Couch, queen bed, dresser, ~40 boxes. Need 2-3 movers.',
  'Pet Grooming': 'e.g. Full grooming for a medium Golden Retriever — bath, blow dry, haircut, nail trim, ear cleaning. Some matting behind the ears.',
};

const DEFAULT_PLACEHOLDER = 'e.g. Describe the job in detail — what needs to be done, the scope, location, and any specific requirements or materials.';

export default function Step1ClientJob({ clientInfo, onClientInfoChange, jobDescription, onJobDescriptionChange, businessType }) {
  const update = (field, value) => {
    onClientInfoChange({ ...clientInfo, [field]: value });
  };

  const placeholder = JOB_PLACEHOLDERS[businessType] || DEFAULT_PLACEHOLDER;

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-navy mb-1.5">
          Client Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={clientInfo.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="e.g. Sarah Johnson"
          className="w-full h-12 px-4 rounded-lg border border-navy/15 text-navy bg-white outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 placeholder:text-navy/30 text-base"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-navy mb-1.5">Client Email</label>
        <input
          type="email"
          value={clientInfo.email}
          onChange={(e) => update('email', e.target.value)}
          placeholder="sarah@email.com"
          className="w-full h-12 px-4 rounded-lg border border-navy/15 text-navy bg-white outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 placeholder:text-navy/30 text-base"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-navy mb-1.5">Phone</label>
          <input
            type="tel"
            value={clientInfo.phone}
            onChange={(e) => update('phone', formatPhone(e.target.value))}
            placeholder="(555) 123-4567"
            className="w-full h-12 px-4 rounded-lg border border-navy/15 text-navy bg-white outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 placeholder:text-navy/30 text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-navy mb-1.5">Address</label>
          <input
            type="text"
            value={clientInfo.address}
            onChange={(e) => update('address', e.target.value)}
            placeholder="123 Main St"
            className="w-full h-12 px-4 rounded-lg border border-navy/15 text-navy bg-white outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 placeholder:text-navy/30 text-base"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-navy mb-1.5">
          Describe the Job <span className="text-red-400">*</span>
        </label>
        <textarea
          value={jobDescription}
          onChange={(e) => onJobDescriptionChange(e.target.value)}
          placeholder={placeholder}
          rows={5}
          className="w-full px-4 py-3 rounded-lg border border-navy/15 text-navy bg-white outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 placeholder:text-navy/30 text-base resize-none"
        />
        <p className="text-xs text-navy/40 mt-1.5">
          Be specific — materials, scope, location details help generate a more accurate quote.
        </p>
      </div>

    </div>
  );
}
