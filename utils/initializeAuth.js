// Initialize default admin account if no users exist
export function initializeDefaultUsers() {
  // Check if any team members exist
  const existingMembers = localStorage.getItem('restaurant_team_members')
  const existingCredentials = localStorage.getItem('restaurant_credentials')
  
  if (!existingMembers || JSON.parse(existingMembers).length === 0) {
    // Create default admin accounts
    const defaultUsers = [
      {
        id: 1,
        name: 'Milad Azizi',
        email: 'milad@splitty.nl',
        phone: '+31 6 12345678',
        role: 'Manager',
        status: 'active',
        startDate: new Date().toISOString().split('T')[0],
        hoursThisWeek: 40,
        tipsThisMonth: 0,
        rating: 5.0,
        avatar: null,
        password: 'Splitty2025!' // Your password
      },
      {
        id: 2,
        name: 'Admin Manager',
        email: 'admin@restaurant.nl',
        phone: '+31 6 00000000',
        role: 'Manager',
        status: 'active',
        startDate: new Date().toISOString().split('T')[0],
        hoursThisWeek: 40,
        tipsThisMonth: 0,
        rating: 5.0,
        avatar: null,
        password: 'admin123' // Default password
      }
    ]
    
    // Save to team members
    localStorage.setItem('restaurant_team_members', JSON.stringify(defaultUsers))
    
    // Save to credentials
    const credentials = defaultUsers.map(user => ({
      email: user.email,
      password: user.password,
      name: user.name,
      role: user.role,
      status: user.status
    }))
    localStorage.setItem('restaurant_credentials', JSON.stringify(credentials))
    
    return true
  } else {
    // Ensure Milad's credentials are always present
    try {
      const members = JSON.parse(existingMembers)
      const credentials = JSON.parse(existingCredentials || '[]')
      
      // Check if Milad exists
      const miladExists = members.some(m => m.email === 'milad@splitty.nl')
      const miladInCredentials = credentials.some(c => c.email === 'milad@splitty.nl')
      
      if (!miladExists || !miladInCredentials) {
        const miladUser = {
          id: Date.now().toString(),
          name: 'Milad Azizi',
          email: 'milad@splitty.nl',
          phone: '+31 6 12345678',
          role: 'Manager',
          status: 'active',
          startDate: new Date().toISOString().split('T')[0],
          hoursThisWeek: 40,
          tipsThisMonth: 0,
          rating: 5.0,
          avatar: null,
          password: 'Splitty2025!'
        }
        
        if (!miladExists) {
          members.push(miladUser)
          localStorage.setItem('restaurant_team_members', JSON.stringify(members))
        }
        
        if (!miladInCredentials) {
          credentials.push({
            email: miladUser.email,
            password: miladUser.password,
            name: miladUser.name,
            role: miladUser.role,
            status: miladUser.status
          })
          localStorage.setItem('restaurant_credentials', JSON.stringify(credentials))
        }
        
        return true
      }
    } catch (e) {
      console.error('Error ensuring user credentials:', e)
    }
  }
  
  return false
}