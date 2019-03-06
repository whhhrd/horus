package nl.utwente.horus.representations.signoff

data class SignOffResultPatchDto(
        val create: List<SignOffResultCreateDto>,
        val delete: List<SignOffResultArchiveDto>
)