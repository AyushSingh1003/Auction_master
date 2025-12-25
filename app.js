const INR = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
const INN = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })
const BASE_BUDGET = 30000000
const BASE_PRICE = 500000
const LAST_PRICE = 1500000
const malePools = [
  ["Hardik Thakur","Sonu","Harshad Tandel","Prathamesh Gawli","Keith Alvares","Chinmay Shetye","Guruprasad","Joshua Dsouza"],
  ["Ankit Shah","Rohan Vartak","Daniel Dsouza","Kevin Nauris","Arsalan","Shiven Makwana","Saahil Shirwaikar","Brian Dsouza"],
  ["Amit Rane","Ameet Prabhu","Navneet Kumar","Litty","Ashwin Kumar","Prem Thampy","Yuvraj Patil","Sandeep Chiplunkar"],
  ["Tushar Otari","Shamindra Randiye","Apurva Kenny","Vedang Mhadgut","Jayesh Sarda","Ankit Bharadia","Bhavin S Mehta","Jeet Singh"],
  ["Darryl M","Vedant Rao","Vishal Nanil","Rohan Seth","Varad","Sanket Patil","Yajat Makwana","Ravi Machani"],
  ["Jil","Trevor","Guru Singh","Harshad Gawankar","Dharmesh Thadeshwar","Akshit Mahajan","Suchit","Premsingh Rao"],
  ["Nirham M","Vedant N","Nishil Mehta","Manoj","Ravi Jain","Harsh","Rishit Agrawal","Vaibhav Dedhia"],
  ["Parimal Gala","Jainesh A","Dhruv Daavda","Heet Gandhi","Karan","Vipul Savaliya","Jay Mahetaliya","Chintan Davda"]
]
const femalePools = [
  ["Prerana","Nidhi","Karen","Nirali"],
  ["Leena","Karishma","Bhavika","Amruta"],
  ["Aishwarya","Manju","Disha","Priyanka"],
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
const eligibleTeamsList = document.getElementById('eligibleTeamsList')
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
  const priceVal = parseAmount(soldPrice.value)
  soldPriceHint.textContent = formatINR(priceVal) + ' (' + lakhWord(priceVal) + ')'
  renderEligibleTeams()
}
playerType.addEventListener('change', refreshAuctionSelectors)
poolSelect.addEventListener('change', refreshPlayersForSelectedPool)
playerSelect.addEventListener('change', renderEligibleTeams)
soldPrice.addEventListener('input', () => {
  const priceVal = parseAmount(soldPrice.value)
  soldPriceHint.textContent = formatINR(priceVal) + ' (' + lakhWord(priceVal) + ')'
  renderEligibleTeams()
})
function canTeamBuy(kind, poolIndex, player, team, price) {
  if (price > team.budget) return { ok: false, reason: 'Insufficient budget' }
  if (team.roster.length >= 10) return { ok: false, reason: 'Team size limit' }
  if (kind === 'male') {
    if (team.malePools[poolIndex]) return { ok: false, reason: 'Pool already filled' }
    return { ok: true }
  } else {
    if (!team.captain.pool) return { ok: false, reason: 'Captain not assigned' }
    if (team.female.player) return { ok: false, reason: 'Female slot filled' }
    const pair = pairMap[team.captain.pool]
    if (pair !== poolIndex + 1) return { ok: false, reason: 'Pairing rule' }
    return { ok: true }
  }
}
function renderEligibleTeams() {
  const kind = playerType.value
  const pIdx = Number(poolSelect.value || 0)
  const player = playerSelect.value
  const price = parseAmount(soldPrice.value || 0)
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
    right.textContent = res.ok ? 'Eligible' : res.reason
    right.className = res.ok ? 'ok' : 'no'
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
confirmSaleBtn.addEventListener('click', () => {
  const kind = playerType.value
  const pIdx = Number(poolSelect.value || 0)
  const player = playerSelect.value
  const price = parseAmount(soldPrice.value || 0)
  if (!player) return
  if (isSold(kind, pIdx, player)) return
  const teamId = teamSelect.value
  const team = teamById(teamId)
  const res = canTeamBuy(kind, pIdx, player, team, price)
  const minBid = minBidFor(kind, pIdx)
  if (!res.ok) return
  if (price < minBid) return
  if (price > team.budget) return
  team.budget -= price
  team.spend += price
  team.roster.push({ kind, pool: pIdx + 1, name: player, price })
  if (kind === 'male') team.malePools[pIdx] = player
  else team.female.player = player
  markSold(kind, pIdx, player, team.id, price)
  saveState()
  refreshAll()
  playerSelect.focus()
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
