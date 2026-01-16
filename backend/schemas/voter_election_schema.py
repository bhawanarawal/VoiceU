from pydantic import BaseModel


class VoterElectionCreate(BaseModel):
    voter_id: int
    election_id: int
    position_id: int


class VoterElectionRead(BaseModel):
    id: int
    voter_id: int
    election_id: int
    position_id: int
    has_voted: bool

    model_config = {"from_attributes": True}
