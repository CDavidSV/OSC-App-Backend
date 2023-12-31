import AssociationDB from "./../scheemas/associationSchema";

const sampleAssociation = new AssociationDB({
    name: 'Sample Association',
    description: 'A description of the sample association.',
    logoURL: 'https://example.com/logo.png',
    images: ['https://example.com/image1.png', 'https://example.com/image2.png'],
    thumbnailURL: 'https://example.com/thumbnail.png',
    websiteURL: 'https://example.com',
    facebookURL: 'https://facebook.com/sample',
    instagramURL: 'https://instagram.com/sample',
    categoryId: 'category123',
    tags: ['tag1', 'tag2', 'tag3'],
    contact: {
      email: 'contact@example.com',
      phone: '+1234567890',
      whatsapp: '+1234567890',
    },
    address: '123 Main Street, City, Country',
    rating: 4.5,
  });
  
  // Save the sample document to the database
  sampleAssociation.save()
    .then((savedAssociation) => {
      console.log('Sample association saved:', savedAssociation);
    })
    .catch((error) => {
      console.error('Error saving sample association:', error);
    });
