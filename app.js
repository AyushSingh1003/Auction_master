const INR = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
const INN = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })
const BASE_BUDGET = 30000000
const BASE_PRICE = 500000
const LAST_PRICE = 1500000
const malePools = [
  ["Hardik Thakur","Sonu","Harshad Tandel","Prathamesh Gawli","Keith Alvares","Chinmay Shetye","Guruprasad","Joshua Dsouza"],
  ["Ankit Shah","Rohan Vartak","Daniel Dsouza","Kevin Nauris","Arsalan","Shiven Makwana","Saahil Shirwaikar","Brian Dsouza"],
  ["Amit Rane","Ameet Prabhu","Navneet Kumar","Litty","Ashwin Kumar","Prem Thampy","Yuvraj Patil","Sandeep Chiplunkar"],
  ["Tushar Otari","Shamindra Randive","Apurva Kenny","Vedang Mhadgut","Jayesh Sarda","Ankit Bharadia","Bhavin S Mehta","Jeet Singh"],
  ["Darryl M","Vedant Rao","Vishal Nanil","Rohan Seth","Varad","Sanket Patil","Yajat Makwana","Ravi Machani"],
  ["Jil","Trevor","Ravi Jain","Harshad Gawankar","Dharmesh Thadeshwar","Akshit Mahajan","Suchit","Premsingh Rao"],
  ["Nirham M","Vedant N","Nishil Mehta","Manoj","Guru Singh","Harsh","Rishit Agrawal","Vaibhav Dedhia"],
  ["Parimal Gala","Jainesh A","Dhruv Daavda","Heet Gandhi","Karan","Vipul Savaliya","Jay Mahetaliya","Chintan Davda"]
]
const femalePools = [
  ["Prerana","Nidhi","Disha","Nirali"],
  ["Leenaa","Karishma","Bhavika","Karen"],
  ["Aishwarya","Manju","Amruta","Priyanka"],
  ["Aditi","Kavita","Hetal","Neha"]
]
const pairMap = { 1:4, 4:1, 2:3, 3:2 }
const tabs = Array.from(document.querySelectorAll('.tab-btn'))
const sections = { setup: document.getElementById('setup'), auctioneer: document.getElementById('auctioneer'), teams: document.getElementById('teams'), pools: document.getElementById('pools'), summary: document.getElementById('summary') }
const budgetsStrip = document.getElementById('budgetsStrip')
const lastPlayerRule = document.getElementById('lastPlayerRule')
const fixedPriceWrap = document.getElementById('fixedPriceWrap')
const fixedPriceInput = document.getElementById('fixedPriceInput')
const fixedPriceHint = document.getElementById('fixedPriceHint')
const resetStateBtn = document.getElementById('resetStateBtn')
const captainsForm = document.getElementById('captainsForm')
const saveCaptainsBtn = document.getElementById('saveCaptainsBtn')
const teamsConfig = document.getElementById('teamsConfig')
const playerType = document.getElementById('playerType')
const poolSelect = document.getElementById('poolSelect')
const playerSelect = document.getElementById('playerSelect')
const soldPrice = document.getElementById('soldPrice')
const soldPriceHint = document.getElementById('soldPriceHint')
const teamSelect = document.getElementById('teamSelect')
const confirmSaleBtn = document.getElementById('confirmSaleBtn')
const undoBtn = document.getElementById('undoBtn')
const eligibleTeamsList = document.getElementById('eligibleTeamsList')
 const errorModal = document.getElementById('errorModal')
 const modalErrorMessage = document.getElementById('modalErrorMessage')
 const modalCloseBtn = document.getElementById('modalCloseBtn')
 const warningModal = document.getElementById('warningModal')
 const warningMessage = document.getElementById('warningMessage')
 const warningProceedBtn = document.getElementById('warningProceedBtn')
 const warningCancelBtn = document.getElementById('warningCancelBtn')
 let pendingWarningAction = null
 
 function showModal(msg) {
   modalErrorMessage.textContent = msg
   errorModal.classList.remove('hidden')
 }
modalCloseBtn.addEventListener('click', () => {
  errorModal.classList.add('hidden')
})
 errorModal.addEventListener('click', (e) => {
   if (e.target === errorModal) errorModal.classList.add('hidden')
 })
 function showWarning(msg, onProceed) {
   warningMessage.textContent = msg
   pendingWarningAction = onProceed || null
   warningModal.classList.remove('hidden')
 }
 warningProceedBtn.addEventListener('click', () => {
   warningModal.classList.add('hidden')
   const fn = pendingWarningAction
   pendingWarningAction = null
   if (typeof fn === 'function') fn()
 })
 warningCancelBtn.addEventListener('click', () => {
   warningModal.classList.add('hidden')
   pendingWarningAction = null
 })
 warningModal.addEventListener('click', (e) => {
   if (e.target === warningModal) {
     warningModal.classList.add('hidden')
     pendingWarningAction = null
   }
 })
const eligibilityNote = document.getElementById('eligibilityNote')
const teamsGrid = document.getElementById('teamsGrid')
const malePoolsGrid = document.getElementById('malePoolsGrid')
const femalePoolsGrid = document.getElementById('femalePoolsGrid')
const exportCsvBtn = document.getElementById('exportCsvBtn')
const printBtn = document.getElementById('printBtn')
const summaryTable = document.getElementById('summaryTable')
const subtabBtns = Array.from(document.querySelectorAll('.subtab-btn'))
let state = loadState() || initState()
function initState() {
  const teams = Array.from({ length: 8 }).map((_, i) => ({
    id: 'T' + (i + 1),
    name: 'Team ' + (i + 1),
    budget: BASE_BUDGET,
    spend: 0,
    malePools: Array.from({ length: 8 }).map(() => null),
    roster: [],
    captain: { name: '', pool: null },
    female: { player: null }
  }))
  const sold = { male: {}, female: {} }
  return { teams, sold, setting: { lastRule: '15L', fixedPrice: LAST_PRICE } }
}
let historyStack = []
function pushHistory() {
  historyStack.push(JSON.parse(JSON.stringify(state)))
  if (historyStack.length > 50) historyStack.shift()
}
function undoLastAction() {
  if (historyStack.length === 0) {
    alert('Nothing to undo!')
    return
  }
  state = historyStack.pop()
  saveState()
  refreshAll()
}
function saveState() { localStorage.setItem('auction_master_state', JSON.stringify(state)) }
function loadState() { try { const s = localStorage.getItem('auction_master_state'); return s ? JSON.parse(s) : null } catch { return null } }
function parseAmount(v) {
  if (typeof v === 'number') return v || 0
  if (!v) return 0
  let s = String(v).trim().toLowerCase()
  const hasCrore = s.includes('crore') || s.includes('cr')
  const hasLakh = s.includes('lakh') || s.includes('lac')
  const hasThousand = s.includes('thousand') || /k$/.test(s)
  s = s.replace(/₹/g, '').replace(/,/g, '')
  if (hasCrore) {
    const n = parseFloat(s.replace(/[^\d.]/g, ''))
    return isNaN(n) ? 0 : Math.round(n * 10000000)
  }
  if (hasLakh) {
    const n = parseFloat(s.replace(/[^\d.]/g, ''))
    return isNaN(n) ? 0 : Math.round(n * 100000)
  }
  if (hasThousand) {
    const n = parseFloat(s.replace(/[^\d.]/g, ''))
    return isNaN(n) ? 0 : Math.round(n * 1000)
  }
  const num = parseInt(s.replace(/[^\d]/g, ''), 10)
  return isNaN(num) ? 0 : num
}

function parseSoldPrice(v) {
  if (typeof v === 'number') return v || 0
  if (!v) return 0
  let s = String(v).trim().toLowerCase()
  
  // If specific suffixes are present, use standard parsing
  const hasSuffix = s.includes('lakh') || s.includes('lac') || s.includes('crore') || s.includes('cr') || s.includes('thousand') || /k$/.test(s)
  if (hasSuffix) {
    return parseAmount(v)
  }

  // Remove currency symbols and commas
  s = s.replace(/₹/g, '').replace(/,/g, '')
  const n = parseFloat(s)
  if (isNaN(n)) return 0
  
  // Heuristic: If number is small (< 1000), assume user means Lakhs (x100,000).
  // E.g. "5" -> 5,00,000. "15.5" -> 15,50,000.
  // If number is large (>= 1000), assume absolute value.
  // E.g. "500000" -> 5,00,000.
  if (n < 1000) {
    return Math.round(n * 100000)
  }
  return Math.round(n)
}

function calculateMinRequiredBudget(team, excludeKind = null, excludePoolIndex = null) {
  let required = 0
  // Male pools
  for (let i = 0; i < 8; i++) {
    if (!team.malePools[i]) {
      // If we are currently buying this slot, don't count it as a "future" requirement
      if (excludeKind === 'male' && excludePoolIndex === i) continue
      
      const minCost = minBidFor('male', i)
      required += minCost
    }
  }
  // Female slot
  if (!team.female.player) {
    if (team.captain.pool) {
      const targetPoolNum = pairMap[team.captain.pool]
      const targetPoolIdx = targetPoolNum - 1
      
      // If we are currently buying this female slot
      const isBuyingFemale = (excludeKind === 'female' && excludePoolIndex === targetPoolIdx)
      
      if (!isBuyingFemale) {
         const minCost = minBidFor('female', targetPoolIdx)
         required += minCost
      }
    } else {
       // If captain not assigned, we can't determine pool, but we know min cost is at least 5L.
       required += BASE_PRICE 
    }
  }
  return required
}

// AUTO-COMPLETE LOGIC:
// Check if a team only needs "Last Players" in their remaining pools.
// If so, we might want to flag them or auto-assign. 
// However, the prompt says "If a team’s remaining required players are ALL Last players... Then: Each of those players is assigned automatically".
// This implies an automatic action. We should run this check after every sale.

function checkAndRunAutoCompletion() {
  let changed = false
  state.teams.forEach(t => {
    // 1. Identify remaining needs
    let needsMale = []
    for(let i=0; i<8; i++) {
      if(!t.malePools[i]) needsMale.push(i)
    }
    let needsFemale = !t.female.player
    let femalePoolIdx = -1
    if (needsFemale && t.captain.pool) {
      femalePoolIdx = pairMap[t.captain.pool] - 1
    }

    // 2. Check if ALL remaining needs are "Last Players"
    // "Last Player" means only 1 player remaining in that pool.
    
    let allAreLast = true
    
    // Check male pools
    for (let pIdx of needsMale) {
      const remainingCount = malePools[pIdx].filter(p => !isSold('male', pIdx, p)).length
      if (remainingCount > 1) {
        allAreLast = false
        break
      }
    }
    
    // Check female pool if needed
    if (allAreLast && needsFemale) {
      if (femalePoolIdx === -1) {
        // Captain not set? Can't determine. Treat as not ready.
        allAreLast = false 
      } else {
        const remainingCount = femalePools[femalePoolIdx].filter(p => !isSold('female', femalePoolIdx, p)).length
        if (remainingCount > 1) allAreLast = false
      }
    }

    // If a team has no remaining players needed, allAreLast is technically true (empty set), 
    // but we shouldn't do anything.
    if ((needsMale.length === 0 && !needsFemale)) allAreLast = false

    // 3. If condition met, execute auto-buys
    if (allAreLast) {
      // Execute auto-buys for this team
      // We need to be careful not to double-process in one pass, but since we modify state, we should probably do one by one or batch.
      
      // Process Male
      needsMale.forEach(pIdx => {
        const available = malePools[pIdx].filter(p => !isSold('male', pIdx, p))
        if (available.length === 1) {
          const player = available[0]
          const price = LAST_PRICE // 15L
          
          // Double check budget (should be guaranteed by safety rules, but good to check)
          if (t.budget >= price) {
             t.budget -= price
             t.spend += price
             t.roster.push({ kind: 'male', pool: pIdx + 1, name: player, price })
             t.malePools[pIdx] = player
             markSold('male', pIdx, player, t.id, price)
             changed = true
             // alert(`Auto-assigned ${player} to ${t.name} for ${formatINR(price)} (Last Player Rule)`)
          }
        }
      })

      // Process Female
      if (needsFemale && femalePoolIdx !== -1) {
         const available = femalePools[femalePoolIdx].filter(p => !isSold('female', femalePoolIdx, p))
         if (available.length === 1) {
           const player = available[0]
           const price = LAST_PRICE
           if (t.budget >= price) {
             t.budget -= price
             t.spend += price
             t.roster.push({ kind: 'female', pool: femalePoolIdx + 1, name: player, price })
             t.female.player = player
             markSold('female', femalePoolIdx, player, t.id, price)
             changed = true
             // alert(`Auto-assigned ${player} to ${t.name} for ${formatINR(price)} (Last Player Rule)`)
           }
         }
      }
      
      if (changed) {
        showModal(`✅ Auto-Completion Triggered\n\nTeam ${t.name} only had "Last Players" remaining.\n\nAll remaining players have been automatically assigned at ₹15L each.`)
      }
    }
  })
  
  if (changed) {
    saveState()
    refreshAll()
  }
}

function indianNumber(n) { return INN.format(n) }
function lakhWord(n) {
  if (n >= 10000000) {
    const v = n / 10000000
    const s = Number.isInteger(v) ? String(v) : (Math.round(v * 100) / 100).toFixed(2).replace(/\.00$/, '')
    return s + ' crore'
  }
  if (n >= 100000) {
    const v = n / 100000
    const s = Number.isInteger(v) ? String(v) : (Math.round(v * 100) / 100).toFixed(2).replace(/\.00$/, '')
    return s + ' lakh'
  }
  if (n >= 1000) {
    const v = n / 1000
    const s = Number.isInteger(v) ? String(v) : (Math.round(v * 100) / 100).toFixed(2).replace(/\.00$/, '')
    return s + ' thousand'
  }
  return indianNumber(n)
}
function switchTab(key) {
  Object.values(sections).forEach(s => s.classList.add('hidden'))
  sections[key].classList.remove('hidden')
  tabs.forEach(b => b.classList.toggle('active', b.dataset.tab === key))
}
tabs.forEach(b => b.addEventListener('click', () => switchTab(b.dataset.tab)))
subtabBtns.forEach(b => b.addEventListener('click', () => {
  subtabBtns.forEach(x => x.classList.toggle('active', x === b))
  const k = b.dataset.subtab
  malePoolsGrid.classList.toggle('hidden', k !== 'male')
  femalePoolsGrid.classList.toggle('hidden', k !== 'female')
}))
lastPlayerRule.addEventListener('change', () => {
  fixedPriceWrap.classList.toggle('hidden', lastPlayerRule.value !== 'fixed')
  state.setting.lastRule = lastPlayerRule.value
  saveState()
  refreshAll()
})
fixedPriceInput.addEventListener('input', () => {
  const val = parseAmount(fixedPriceInput.value)
  state.setting.fixedPrice = Math.max(0, val)
  fixedPriceHint.textContent = formatINR(state.setting.fixedPrice) + ' (' + lakhWord(state.setting.fixedPrice) + ')'
  saveState()
  renderEligibleTeams()
})
resetStateBtn.addEventListener('click', () => {
  localStorage.removeItem('auction_master_state')
  state = initState()
  refreshAll()
})
function minBidFor(poolType, poolIndex) {
  const remaining = poolType === 'male' ? malePools[poolIndex].filter(p => !isSold('male', poolIndex, p)).length : femalePools[poolIndex].filter(p => !isSold('female', poolIndex, p)).length
  if (remaining === 1) {
    if (state.setting.lastRule === 'fixed') return state.setting.fixedPrice
    return LAST_PRICE
  }
  return BASE_PRICE
}
function isSold(kind, poolIndex, player) {
  const s = state.sold[kind][poolIndex]
  return s && s[player]
}
function markSold(kind, poolIndex, player, teamId, price) {
  if (!state.sold[kind][poolIndex]) state.sold[kind][poolIndex] = {}
  state.sold[kind][poolIndex][player] = { teamId, price }
}
function teamById(id) { return state.teams.find(t => t.id === id) }
function formatINR(n) { return INR.format(n) }
function refreshBudgets() {
  budgetsStrip.innerHTML = ''
  state.teams.forEach(t => {
    const el = document.createElement('div')
    el.className = 'budget-chip'
    const name = document.createElement('div')
    name.className = 'name'
    name.textContent = t.name
    const value = document.createElement('div')
    value.className = 'value'
    value.textContent = formatINR(t.budget)
    el.appendChild(name); el.appendChild(value)
    budgetsStrip.appendChild(el)
  })
}
function renderCaptainsForm() {
  captainsForm.innerHTML = ''
  state.teams.forEach(t => {
    const row = document.createElement('div')
    row.className = 'setup-row'
    const teamLabel = document.createElement('div')
    teamLabel.textContent = t.name
    const captainName = document.createElement('input')
    captainName.type = 'text'
    captainName.placeholder = 'Captain name'
    captainName.value = t.captain.name || ''
    const captainPool = document.createElement('select')
    ;[1,2,3,4].forEach(i => {
      const opt = document.createElement('option')
      opt.value = i; opt.textContent = 'Pool ' + i
      if (t.captain.pool === i) opt.selected = true
      captainPool.appendChild(opt)
    })
    row.appendChild(teamLabel); row.appendChild(captainName); row.appendChild(captainPool)
    captainsForm.appendChild(row)
    row.dataset.teamId = t.id
  })
}
function renderTeamsConfig() {
  teamsConfig.innerHTML = ''
  state.teams.forEach(t => {
    const row = document.createElement('div')
    row.className = 'setup-row'
    const nameLabel = document.createElement('input')
    nameLabel.type = 'text'
    nameLabel.value = t.name
    const budgetLabel = document.createElement('div')
    budgetLabel.textContent = formatINR(t.budget)
    const span = document.createElement('div')
    span.textContent = 'Captain Pool ' + (t.captain.pool || '-')
    row.appendChild(nameLabel); row.appendChild(budgetLabel); row.appendChild(span)
    teamsConfig.appendChild(row)
    nameLabel.addEventListener('input', () => { t.name = nameLabel.value; saveState(); refreshBudgets(); renderTeamsGrid(); renderPools(); renderSummary() })
  })
}
saveCaptainsBtn.addEventListener('click', () => {
  pushHistory()
  const rows = Array.from(captainsForm.children)
  rows.forEach(r => {
    const id = r.dataset.teamId
    const inputs = r.querySelectorAll('input,select')
    const name = inputs[0].value.trim()
    const pool = Number(inputs[1].value)
    const t = teamById(id)
    t.captain = { name, pool }
    saveState()
  })
  renderTeamsConfig()
  renderTeamsGrid()
})
function refreshAuctionSelectors() {
  poolSelect.innerHTML = ''
  playerSelect.innerHTML = ''
  if (playerType.value === 'male') {
    for (let i = 1; i <= 8; i++) {
      const opt = document.createElement('option')
      opt.value = i - 1; opt.textContent = 'Pool ' + i
      poolSelect.appendChild(opt)
    }
  } else {
    for (let i = 1; i <= 4; i++) {
      const opt = document.createElement('option')
      opt.value = i - 1; opt.textContent = 'Pool ' + i
      poolSelect.appendChild(opt)
    }
  }
  refreshPlayersForSelectedPool()
}
function refreshPlayersForSelectedPool() {
  playerSelect.innerHTML = ''
  const kind = playerType.value
  const pIdx = Number(poolSelect.value || 0)
  const list = kind === 'male' ? malePools[pIdx] : femalePools[pIdx]
  list.forEach(name => {
    if (!isSold(kind, pIdx, name)) {
      const opt = document.createElement('option')
      opt.value = name; opt.textContent = name
      playerSelect.appendChild(opt)
    }
  })
  const minBid = minBidFor(kind, pIdx)
  const priceVal = parseSoldPrice(soldPrice.value)
  soldPriceHint.textContent = formatINR(priceVal) + ' (' + lakhWord(priceVal) + ')'
  renderEligibleTeams()
}
playerType.addEventListener('change', refreshAuctionSelectors)
poolSelect.addEventListener('change', refreshPlayersForSelectedPool)
playerSelect.addEventListener('change', renderEligibleTeams)
soldPrice.addEventListener('input', () => {
  const priceVal = parseSoldPrice(soldPrice.value)
  soldPriceHint.textContent = formatINR(priceVal) + ' (' + lakhWord(priceVal) + ')'
  renderEligibleTeams()
})
function canTeamBuy(kind, poolIndex, player, team, price) {
  if (price > team.budget) return { ok: false, reason: 'Insufficient budget' }
  // Team must buy exactly 9 auction players (excluding captain)
  if (team.roster.length >= 9) return { ok: false, reason: 'Team completed' }
  if (kind === 'male') {
    if (team.malePools[poolIndex]) return { ok: false, reason: 'Pool already filled' }
  } else {
    if (!team.captain.pool) return { ok: false, reason: 'Captain not assigned' }
    if (team.female.player) return { ok: false, reason: 'Female slot filled' }
    const pair = pairMap[team.captain.pool]
    if (pair !== poolIndex + 1) return { ok: false, reason: 'Pairing rule' }
  }

  // HARD BLOCK: absolute minimum required based on pools (5L or 15L per pool)
  const minRequiredForOthers = calculateMinRequiredBudget(team, kind, poolIndex)
  const budgetAfterBid = team.budget - price
  if (budgetAfterBid < minRequiredForOthers) {
    return { 
      ok: false, 
      reason: 'Safety Rule Block', 
      detail: `❌ Bid Not Allowed\n\nThis bid makes it mathematically impossible\nto complete the team, even at minimum prices.` 
    }
  }

  return { ok: true }
}
function renderEligibleTeams() {
  const kind = playerType.value
  const pIdx = Number(poolSelect.value || 0)
  const player = playerSelect.value
  const price = parseSoldPrice(soldPrice.value || 0)
  teamSelect.innerHTML = ''
  eligibleTeamsList.innerHTML = ''
  const minBid = minBidFor(kind, pIdx)
  eligibilityNote.textContent = 'Min bid ' + formatINR(minBid) + ' (' + lakhWord(minBid) + ')'
  state.teams.forEach(t => {
    const res = canTeamBuy(kind, pIdx, player, t, price)
    const opt = document.createElement('option')
    opt.value = t.id; opt.textContent = t.captain.name ? t.captain.name : t.name
    opt.disabled = !res.ok
    teamSelect.appendChild(opt)
    const row = document.createElement('div')
    row.className = 'eligible-item'
    const left = document.createElement('div')
    left.textContent = t.name
    const right = document.createElement('div')
    
    if (res.ok) {
      right.textContent = 'Eligible'
      right.className = 'ok'
    } else {
      if (res.reason === 'Safety Rule Block' || res.reason === 'Fairness Rule Block') {
         right.textContent = 'Blocked: ' + res.detail
      } else {
         right.textContent = res.reason
      }
      right.className = 'no'
    }
    
    row.appendChild(left); row.appendChild(right)
    eligibleTeamsList.appendChild(row)
  })
  const firstEnabled = Array.from(teamSelect.options).find(o => !o.disabled)
  if (firstEnabled) teamSelect.value = firstEnabled.value
  confirmSaleBtn.disabled = !Array.from(teamSelect.options).some(o => !o.disabled && o.selected)
}
teamSelect.addEventListener('change', () => {
  confirmSaleBtn.disabled = !Array.from(teamSelect.options).some(o => !o.disabled && o.selected)
})
undoBtn.addEventListener('click', undoLastAction)
confirmSaleBtn.addEventListener('click', () => {
  const kind = playerType.value
  const pIdx = Number(poolSelect.value || 0)
  const player = playerSelect.value
  const price = parseSoldPrice(soldPrice.value || 0)
  if (!player) return
  if (isSold(kind, pIdx, player)) return
  const teamId = teamSelect.value
  const team = teamById(teamId)
  const res = canTeamBuy(kind, pIdx, player, team, price)
  const minBid = minBidFor(kind, pIdx)
  if (!res.ok) {
    const msg = res.detail ? res.detail : `❌ Bid Not Allowed\n\nReason: ${res.reason}`
    showModal(msg)
    return
  }
  if (price < minBid) {
    showModal(`❌ Bid Too Low\n\nMinimum bid for this player is ${formatINR(minBid)}`)
    return
  }
  if (price > team.budget) {
    showModal(`❌ Insufficient Budget\n\nTeam only has ${formatINR(team.budget)} remaining.`)
    return
  }
  const playersRemaining = 9 - team.roster.length
  const safeReserve = playersRemaining * LAST_PRICE
  const safeMaxBid = team.budget - safeReserve
  const doSale = () => {
    pushHistory()
    team.budget -= price
    team.spend += price
    team.roster.push({ kind, pool: pIdx + 1, name: player, price })
    if (kind === 'male') team.malePools[pIdx] = player
    else team.female.player = player
    markSold(kind, pIdx, player, team.id, price)
    checkAndRunAutoCompletion()
    saveState()
    refreshAll()
    playerSelect.focus()
  }
  if (price > safeMaxBid) {
    const warnMsg = `⚠️ High Risk Bid\n\nThis bid exceeds the recommended safe limit.\nTeam completion is possible ONLY if future players are bought at minimum prices.\n\nProceed only if you understand the risk.`
    showWarning(warnMsg, doSale)
    return
  }
  doSale()
})
function renderTeamsGrid() {
  teamsGrid.innerHTML = ''
  state.teams.forEach(t => {
    const card = document.createElement('div')
    card.className = 'team-card'
    const header = document.createElement('div')
    header.className = 'header'
    const name = document.createElement('div')
    name.textContent = t.name
    const budget = document.createElement('div')
    budget.className = 'budget'
    budget.textContent = formatINR(t.budget)
    header.appendChild(name); header.appendChild(budget)
    
    // Safety Stats
    const stats = document.createElement('div')
    stats.className = 'team-stats'
    
    // Fairness rule: reserve ₹15L for each remaining auction player
    const remainingCount = 9 - t.roster.length
    const minReq = remainingCount * LAST_PRICE
    const maxBid = t.budget - minReq
    
    stats.innerHTML = `
      <div class="stat-row">
        <span class="stat-label">💰 Remaining Budget:</span>
        <span class="stat-val">${formatINR(t.budget)}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Remaining Required Players:</span>
        <span class="stat-val">${remainingCount}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">🔒 Reserved (to finish team):</span>
        <span class="stat-val">${formatINR(minReq)}</span>
      </div>
    `

    if (maxBid < 500000) {
       const disabledBlock = document.createElement('div')
       disabledBlock.className = 'bidding-disabled'
       disabledBlock.innerHTML = `🚫 BIDDING DISABLED<small>Only minimum compulsory purchases remain</small>`
       stats.appendChild(disabledBlock)
    } else {
       const maxBlock = document.createElement('div')
       maxBlock.className = 'max-bid-block'
       if (maxBid > 2000000) maxBlock.classList.add('safe')
       else if (maxBid >= 500000) maxBlock.classList.add('warn')
       else maxBlock.classList.add('danger')
       
       maxBlock.innerHTML = `
         <h5>🔥 MAX BID ALLOWED</h5>
         <div class="value">${formatINR(maxBid)}</div>
       `
       stats.appendChild(maxBlock)
    }
    
    card.appendChild(stats)

    const caps = document.createElement('div')
    caps.className = 'chips'
    const capChip = document.createElement('div')
    capChip.className = 'chip ok'
    capChip.textContent = 'Captain ' + (t.captain.name || '-') + ' P' + (t.captain.pool || '-')
    const femChip = document.createElement('div')
    femChip.className = 'chip ' + (t.female.player ? 'ok' : 'no')
    femChip.textContent = 'Female ' + (t.female.player || 'Pending')
    caps.appendChild(capChip); caps.appendChild(femChip)
    const pools = document.createElement('div')
    pools.className = 'chips'
    for (let i = 0; i < 8; i++) {
      const chip = document.createElement('div')
      const filled = !!t.malePools[i]
      chip.className = 'chip ' + (filled ? 'ok' : 'no')
      chip.textContent = 'P' + (i + 1) + ' ' + (filled ? 'Done' : 'Pending')
      pools.appendChild(chip)
    }
    const list = document.createElement('div')
    list.className = 'pool-list'
    t.roster.forEach(r => {
      const item = document.createElement('div')
      item.className = 'pool-item'
      const left = document.createElement('div')
      left.textContent = r.name + ' (' + (r.kind === 'male' ? 'M' : 'F') + ' P' + r.pool + ')'
      const right = document.createElement('div')
      right.textContent = formatINR(r.price)
      item.appendChild(left); item.appendChild(right)
      list.appendChild(item)
    })
    card.appendChild(header)
    card.appendChild(caps)
    card.appendChild(pools)
    card.appendChild(list)
    teamsGrid.appendChild(card)
  })
}
function renderPools() {
  malePoolsGrid.innerHTML = ''
  femalePoolsGrid.innerHTML = ''
  malePools.forEach((players, idx) => {
    const card = document.createElement('div')
    card.className = 'pool-card'
    const title = document.createElement('h4')
    title.textContent = 'Male Pool ' + (idx + 1)
    const list = document.createElement('div')
    list.className = 'pool-list'
    players.forEach(p => {
      const item = document.createElement('div')
      const soldInfo = isSold('male', idx, p)
      item.className = 'pool-item ' + (soldInfo ? 'sold' : 'available')
      const left = document.createElement('div')
      left.textContent = p
      const right = document.createElement('div')
      right.className = 'tag'
      right.textContent = soldInfo ? (teamById(soldInfo.teamId).name + ' ' + formatINR(soldInfo.price)) : 'Available'
      item.appendChild(left); item.appendChild(right)
      list.appendChild(item)
    })
    card.appendChild(title); card.appendChild(list)
    malePoolsGrid.appendChild(card)
  })
  femalePools.forEach((players, idx) => {
    const card = document.createElement('div')
    card.className = 'pool-card'
    const title = document.createElement('h4')
    title.textContent = 'Female Pool ' + (idx + 1)
    const list = document.createElement('div')
    list.className = 'pool-list'
    players.forEach(p => {
      const item = document.createElement('div')
      const soldInfo = isSold('female', idx, p)
      item.className = 'pool-item ' + (soldInfo ? 'sold' : 'available')
      const left = document.createElement('div')
      left.textContent = p
      const right = document.createElement('div')
      right.className = 'tag'
      right.textContent = soldInfo ? (teamById(soldInfo.teamId).name + ' ' + formatINR(soldInfo.price)) : 'Available'
      item.appendChild(left); item.appendChild(right)
      list.appendChild(item)
    })
    card.appendChild(title); card.appendChild(list)
    femalePoolsGrid.appendChild(card)
  })
}
function complianceFor(t) {
  const budgetOk = t.budget >= 0 && t.spend <= BASE_BUDGET
  const maleOk = t.malePools.filter(Boolean).length <= 8
  const femaleOk = !!t.captain.pool && (!t.female.player || !!t.female.player)
  const sizeOk = (t.roster.length + (t.captain.name ? 1 : 1)) <= 10
  return { budgetOk, maleOk, femaleOk, sizeOk }
}
function renderSummary() {
  const table = document.createElement('table')
  table.className = 'summary-table'
  const thead = document.createElement('thead')
  const trh = document.createElement('tr')
  ;['Team','Spend','Remaining','Male Filled','Female Done','Compliance'].forEach(h => {
    const th = document.createElement('th'); th.textContent = h; trh.appendChild(th)
  })
  thead.appendChild(trh)
  const tbody = document.createElement('tbody')
  state.teams.forEach(t => {
    const tr = document.createElement('tr')
    const maleFilled = t.malePools.filter(Boolean).length
    const femaleDone = !!t.female.player
    const c = complianceFor(t)
    const ok = c.budgetOk && c.sizeOk && maleFilled <= 8 && (!!t.captain.pool) && (femaleDone ? true : true)
    ;[
      t.name,
      formatINR(t.spend),
      formatINR(t.budget),
      String(maleFilled) + '/8',
      femaleDone ? 'Yes' : 'No',
      ok ? 'OK' : 'Check'
    ].forEach(val => { const td = document.createElement('td'); td.textContent = val; tr.appendChild(td) })
    tbody.appendChild(tr)
  })
  table.appendChild(thead); table.appendChild(tbody)
  summaryTable.innerHTML = ''
  summaryTable.appendChild(table)
}
function exportCsv() {
  const rows = [['Team','Spend','Remaining','MaleFilled','FemaleDone']]
  state.teams.forEach(t => {
    rows.push([t.name, t.spend, t.budget, t.malePools.filter(Boolean).length, t.female.player ? 'Yes' : 'No'])
  })
  const csv = rows.map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'auction_summary.csv'
  a.click()
  URL.revokeObjectURL(url)
}
exportCsvBtn.addEventListener('click', exportCsv)
printBtn.addEventListener('click', () => window.print())
function refreshAll() {
  lastPlayerRule.value = state.setting.lastRule
  fixedPriceInput.value = indianNumber(state.setting.fixedPrice)
  fixedPriceHint.textContent = formatINR(state.setting.fixedPrice) + ' (' + lakhWord(state.setting.fixedPrice) + ')'
  fixedPriceWrap.classList.toggle('hidden', lastPlayerRule.value !== 'fixed')
  renderCaptainsForm()
  renderTeamsConfig()
  refreshBudgets()
  refreshAuctionSelectors()
  const sp = parseAmount(soldPrice.value)
  soldPriceHint.textContent = formatINR(sp) + ' (' + lakhWord(sp) + ')'
  renderTeamsGrid()
  renderPools()
  renderSummary()
}
refreshAll()
